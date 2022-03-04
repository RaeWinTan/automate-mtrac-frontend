export const driverChecklist = {
  title: 'Driving permit holder',
  fieldName: 'driverChecklist',
  fields: [
    ['Ensure no admin movement during No-Move timings (0730H-0930H & 1730H-1930H)', 'noMove'],
    [
      'The transport operator is licensed to operate the vehicle and has displayed Military permit on dashboard',
      'licensed',
    ],
    ['Brief and ensure troops secure their seat belts before movement of vehicle', 'seatBelts'],
    ['Brief on no sleeping or smoking on the vehicle before movement', 'noSleepingSmoking'],
    ['Secure load before movement of vehicle', 'secureLoad'],
    ['Check and ensure safety straps in place and tailboard of vehicle is closed', 'safetyStraps'],
    [
      'If involved in an accident, to contact parent unit, Transport Node, and Police',
      'inCaseAccident',
    ],
  ],
};
export enum risk {
  LOW = "LOW",
  LOW_ = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  NO_MOVE = "NO_MOVE",
  NA = "NA"
}
export const mainStuff = [
    {  title: 'Vehicle No',
      fieldName: 'vehicleNo',
      type: "number"
    },
    {  title: 'Avi Date',
      fieldName: 'aviDate',
      type: "date"
    },
    {  title: 'journey From',
      fieldName: 'journeyFrom',
      type:"text"
    },
    {  title: 'journey To',
      fieldName: 'journeyTo',
      type:"text"
    }
];

export const racRiskFields = [
  {
    title: 'Experience',
    fieldName: 'experience',
    fields: [
      ['Cat A or B', risk.LOW],
      ['Cat C', risk.MEDIUM],
      ['Cat D', risk.HIGH],
      [
        'Not trained in vehicle, or JIT not done if applicable',
        risk.NO_MOVE,
      ],
    ],
  },
  {
    title: 'Vehicle type',
    fieldName: 'vehicleType',
    fields: [
      [
        'Operated the same vehicle in the past 10 days / Class 3 / 200CC',
        risk.LOW,
      ],
      ['Class 4 and above / 800CC', risk.MEDIUM],
    ],
  },
  {
    title: 'Fatigue', // length of rest
    fieldName: 'fatigue',
    fields: [
      ['More than 7 hours', risk.LOW],
      ['Less than 7 hours (in camp or home)', risk.MEDIUM],
      ['Less than 7 hours (field)', risk.HIGH],
      ['Less than 4 hours (field)', risk.NO_MOVE],
    ],
  },
  {
    title: 'Health',
    fieldName: 'health',
    fields: [
      ['Good', risk.LOW],
      ['Fair - just recovered from illness', risk.MEDIUM],
      [
        'Poor - ill or still under medication that caused drowsiness',
        risk.NO_MOVE,
      ],
    ],
  },
  {
    title: 'Weather',
    fieldName: 'weather',
    fields: [
      ['Dry', risk.LOW],
      ['Wet', risk.MEDIUM],
      ['Heavy rain', risk.HIGH],
    ],
  },
  {
    title: 'Route familiarity',
    fieldName: 'familiarity',
    fields: [
      ['Familiar', risk.LOW],
      ['Unfamiliar even after route brief done', risk.HIGH],
      ['Unfamiliar as route brief not done', risk.NO_MOVE],
    ],
  },
  {
    title: 'Mission',
    fieldName: 'mission',
    fields: [
      ['Admin', risk.LOW],
      ['Training or operations (including towing)', risk.MEDIUM],
      ['Administrative towing', risk.HIGH],
    ],
  },
  {
    title: 'No vehicle commander',
    fieldName: 'noVcom',
    fields: [
      ['Cat A/B', risk.LOW],
      ['Cat C', risk.MEDIUM],
      ['Cat D', risk.NO_MOVE],
      ['Vehicle commander present', risk.NA],
    ],
  },
  {
    title: 'Fault severity (vehicle serviceability)',
    fieldName: 'vehicleServiceability',
    fields: [
      ['No fault', risk.LOW],
      ['Minor fault', risk.HIGH],
      ['Major fault', risk.NO_MOVE],
    ],
  },
  {
    title: 'JIT',
    fieldName: 'jit',
    fields: [
      ['JIT Not Applicable / JIT Applicable', risk.LOW]
    ],
  }
];

export const defaultTemplate = ():any =>{
  let t = {};
  for (let i of racRiskFields) t[i.fieldName] = "";
  for (let i of mainStuff) t[i.fieldName] = "";
  t[driverChecklist.fieldName] =[];
  t["standingOrder"] = false;
  return t;
};
