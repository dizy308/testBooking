// const testObj = {  "Court1":[], "Court2": [ { "start_time": 14, "end_time": 15, "court_id": 2 } ], "Court3": [] }
const testObj = {
    "Court 2": [
        {
            "start_time": 15,
            "end_time": 16,
            "court_id": 2
        },
        {
            "start_time": 17,
            "end_time": 18,
            "court_id": 2
        },
        {
            "start_time": 16,
            "end_time": 17,
            "court_id": 2
        },
    ],


    "Court 3": [
        {
            "start_time": 16,
            "end_time": 18,
            "court_id": 3
        },
        {
            "start_time": 19,
            "end_time": 20,
            "court_id": 3
        },
        {
            "start_time": 21,
            "end_time": 23,
            "court_id": 3
        },
    ]
}


Object.entries(testObj).forEach(
    ([key,item]) => {
        let sortedItem = item.sort((a,b) => a.start_time - b.start_time)
        testObj[key] = sortedItem
    

    })


// objs.sort((a,b) => a.last_nom - b.last_nom); // b - a for reverse sort
// console.log(testObj)



function equalStartEnd(a,b){
    const result = a.start_time = b.end_time
    return result
}


let testArray = [
    { start_time: 14, end_time: 14.5, court_id: 2},
    { start_time: 15, end_time: 16, court_id: 2 },
    { start_time: 16, end_time: 17, court_id: 2 },
    { start_time: 17, end_time: 18, court_id: 2 },
    { start_time: 20, end_time: 22, court_id: 2 },
  ]



const newValue = testArray.reduce((accumulator, currentValue) =>{
    previousValue = accumulator[accumulator.length - 1]
    if (previousValue !== undefined){
        if (previousValue.end_time === currentValue.start_time){
            const appendValue = {"start_time": previousValue.start_time, "end_time" : currentValue.end_time, "court_id": currentValue.court_id}
            accumulator.splice(accumulator.length - 1)
            return accumulator.concat(appendValue)
        }
        else {
            return accumulator.concat({"start_time":currentValue.start_time, "end_time":currentValue.end_time, "court_id": currentValue.court_id})
    }
    }
    else {
        return accumulator.concat({"start_time":currentValue.start_time, "end_time":currentValue.end_time, "court_id": currentValue.court_id})
    }
}, [])



console.log(newValue)


