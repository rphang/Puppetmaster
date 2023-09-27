
import * as https from "https";
import { Slot } from "../types/slot";

const reg_event = /(?:(?:BEGIN:VEVENT\nDTSTAMP:(?:[A-Z0-9]*?)\nDTSTART:([A-Z0-9]*?)\nDTEND:([A-Z0-9]*?)\nSUMMARY: {0,}([a-zéèàA-Z0-9-. , \\/ô]*?)\nLOCATION:([a-zA-Zéèà0-9-. ,\\]*?)\nDESCRIPTION:(?:\\n){0,}((?:(?:LP(?:[ a-zA-Z0-9\\]*?))\\n){1,})((?:(?:[A-Z]*) (?:[A-Z]*)(?: (?:[A-Z]*)){0,}\\n){0,})(?:.*?)\nEND:VEVENT)|(?:BEGIN:VEVENT\nDTSTAMP:(?:[A-Z0-9]*?)\nDTSTART:([A-Z0-9]*?)\nDTEND:([A-Z0-9]*?)\nSUMMARY: {0,}((?:(?:[a-zA-Z0-9- ()]*)|M(?:[A-Z0-9-]*)(?:\/M(?:[A-Z0-9-]*)){0,}|Conférence|)[a-zéèàA-Z0-9-. , \\/]*?)\nLOCATION:([a-zA-Zéèà0-9-. ,\\()]*?)\nDESCRIPTION:(?:\\n){0,}(.*?)\nUID:(.*?)\n(?:.*?)END:VEVENT))/gs;
const reg_date = /([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})Z/;
const base_url = "https://adelb.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=10069&projectId=3&calType=ical&firstDate=";

function parseGroupAndTeacher(str: string) : [string[], string[]] {
    const groups = [];
    const teachers = [];
    
    str.replace(/^(?:\d+(?:\\){0,1}\\n)/g, ''); // UID

    const c1 = (str.match(/[|a-z,A-Z0-9()]\n/g) || []).length;
    const c2 = (str.match(/\\n/g) || []).length;
    let elements = [];
    if (c1 > c2) {
        elements = str.split('\n');
    } else {
        elements = str.split('\\n');
    }

    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        element = element.replace('\n ', '');
        element = element.replace('\\', '');
        if (element.includes('Exported')) {
            continue;
        }
        if (/^\d*$/g.test(element)) {
            continue;
        }

        if (element.includes('M2')) {
            groups.push(element);
        }
        else if (element !== "") {
            teachers.push(element);
        }
    }
    return [groups, teachers];
}   

function fetchEvents(days = 1, TS_Start = new Date()) : Promise<Slot[]> {
    return new Promise((resolve, reject) => {
        const start = new Date(TS_Start);
        const end = new Date(start);
        end.setDate(end.getDate() + days);

        const url = base_url + start.getFullYear() + "-" + start.getMonth() + "-" + start.getDate() + "&lastDate=" + end.getFullYear() + "-" + end.getMonth() + "-" + end.getDate();
        https.get(url, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                const output = [];
                data = data.replace(/\r/g, "");
                let m;
                while ((m = reg_event.exec(data)) !== null) {
                    if (m.index === reg_event.lastIndex) {
                        reg_event.lastIndex++;
                    }
                    const event: Slot = {
                        uid: m[12],
                        title: m[9],
                        groups: [],
                        locations: [],
                        teachers: [],
                        startDate: new Date(),
                        endDate: new Date()
                    };
                    /*
                    Date
                     */
                    const d1 = reg_date.exec(m[7]);
                    const d2 = reg_date.exec(m[8]);
                    event.startDate = new Date(d1[1] + "-" + d1[2] + "-" + d1[3] + "T" + d1[4] + ":" + d1[5] + ":" + d1[6] + ".00Z");
                    event.endDate = new Date(d2[1] + "-" + d2[2] + "-" + d2[3] + "T" + d2[4] + ":" + d2[5] + ":" + d2[6] + ".00Z");
                    
                    /*
                    Location
                     */
                    event.locations = m[10].split(",");
                    event.locations = event.locations.map((location) => {
                        return location.replace('\\','').trim();
                    })

                    /* Group & Teacher */
                    const [groups, teachers] = parseGroupAndTeacher(m[11]);
                    event.groups = groups;
                    event.teachers = teachers;
                    output.push(event);
                }
                resolve(output);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

async function fetch({
    days = 1,
    startDate = new Date(2023, 8, 1)
}) {
    const events = await fetchEvents(days, startDate);
    return events;
}

export {
    fetch
}