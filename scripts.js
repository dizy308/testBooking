const startCalendar = 6
const endCalendar  = 24


createCourtBlock(3,startCalendar,endCalendar);

const data_ = [
    {'startTime':7, 'endTime':9.5, 'customerName':"Mr.A"},
    // {'startTime':12, 'endTime':13.5, 'customerName':"Mr.B"},
    // {'startTime':10, 'endTime':12, 'customerName':"Mr.A"},
    // {'startTime':23, 'endTime':24, 'customerName':"Mr.F"},
]

const currentCourt = document.querySelector(".court-block")
console.log(currentCourt.offsetWidth, currentCourt.offsetLeft)




data_.forEach( (item, idx) =>{
    start_time = item.startTime
    end_time = item.endTime
    customer_name = item.customerName
    indexPosition = start_time - startCalendar + 1
    chosen_position = `.block_${indexPosition}`
    const currentHourBlock = document.querySelector(chosen_position)
    
    const hasOverlap = data_.some((other, j) => idx !== j && isOverlapping(item, other));
    
    calculatePx(currentHourBlock,  customer_name,start_time, end_time)
    currentHourBlock.classList.toggle('overlap', hasOverlap);
    
})


// -----------------------------------------------------------------------------------------//


function createCourtBlock(courtCount, startHour, endHour){
    const hourBars = document.getElementById('hourBars');
    for (let i = 0; i <= courtCount; i++){
    const courtBlock = document.createElement('div')
    courtBlock.className = `court-block`

    if (i === 0){
        for (let hour = startHour; hour < endHour; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.textContent = `${String(hour).padStart(2,'0')}:00 - ${String(hour + 1).padStart(2,'0')}:00`
        hourBlock.className = 'timeInterval'
        courtBlock.appendChild(hourBlock);
        }
    }
    else{
        courtBlock.id = `court_num_${i}`
        for (let hour = startHour; hour < endHour; hour++) {
            const idx = hour - startHour  
            const hourBlock = document.createElement('div');
            hourBlock.className = `hour_sub_block ${idx}`;
            courtBlock.appendChild(hourBlock)}    
        }

        hourBars.appendChild(courtBlock)}
}


function calculatePx(chosenObject, customerName,startHour, endHour){
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style{
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`,
        backgroundColor: "#50C89F",
    });
    chosenObject.textContent = customerName
    
}

function isOverlapping(a, b) {
    return a.startTime < b.endTime && b.startTime < a.endTime;
}

















