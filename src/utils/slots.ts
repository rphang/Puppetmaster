import { Slot } from '../types/slot'

function parse(slots: Slot[]) {
  const output = {
    teachers: [],
    groups: [],
    locations: []
  }
for (const slot of slots) {
    for (const teacher of slot.teachers) {
      if (!output.teachers.includes(teacher)) {
        output.teachers.push(teacher)
      }
    }
    for (const group of slot.groups) {
      if (!output.groups.includes(group)) {
        output.groups.push(group)
      }
    }
    for (const location of slot.locations) {
      if (!output.locations.includes(location)) {
        output.locations.push(location)
      }
    }
  }
    return output
}

export {
    parse
}