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

function filterBetween(slots: Slot[], startDate: Date, endDate: Date) {
  const output = []
  for (const slot of slots) {
    if (slot.startDate.getTime() >= startDate.getTime() && slot.endDate.getTime() <= endDate.getTime()) {
      output.push(slot)
    }
  }
  // Order by date asc
  output.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  return output
}

function timeStats(slots: Slot[]) {
  const output = {
    totalMinutes: 0,
    classMinutes: 0,
    selfMinutes: 0,
    missingMinutes: 60*35
  }

  for (const slot of slots) {
    const minutes = (slot.endDate.getTime() - slot.startDate.getTime()) / 1000 / 60
    output.totalMinutes += minutes
    if (slot.title.includes('Travaux Personnels')) {
      output.selfMinutes += minutes
    } else {
      output.classMinutes += minutes
    }
  }
  output.missingMinutes -= output.totalMinutes

  return output
}

export {
    parse,
    filterBetween,
    timeStats
}