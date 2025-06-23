const data_ = [
    {'startTime':7, 'endTime':9.5, 'customerName':"Mr.A"},
    {'startTime':9, 'endTime':11.5, 'customerName':"Mr.B"},
    {'startTime':10, 'endTime':12, 'customerName':"Mr.A"},

    
    {'startTime':19, 'endTime':21, 'customerName':"Mr.C"},
    {'startTime':21, 'endTime':22, 'customerName':"Mr.D"},
]

//  Added function
const currentCourt = document.querySelector(".hour_line_court")
console.log(currentCourt.offsetWidth, currentCourt.offsetLeft)

const startCalendar = 6
const endCalendar  = 23


function calculatePx(chosenObject, customerName,startHour, endHour){
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style, {
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`,
        backgroundColor: "#50C89F",
    });
    chosenObject.textContent = customerName
    
}

function isOverlapping(a, b) {
    return a.startTime < b.endTime && b.startTime < a.endTime;
}


data_.forEach( (item, idx) =>{
    start_time = item.startTime
    end_time = item.endTime
    customer_name = item.customerName
    chosen_position = `.block_${idx + 1}`
    const currentHourBlock = document.querySelector(chosen_position)

    const hasOverlap = data_.some((other, j) => idx !== j && isOverlapping(item, other));
    
    calculatePx(currentHourBlock,  customer_name,start_time, end_time)
    currentHourBlock.classList.toggle('overlap', hasOverlap);

})