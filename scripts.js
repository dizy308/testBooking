const startCalendar = 5
const endCalendar  = 24


createCourtBlock(4,startCalendar,endCalendar);


// ------------------------------------------ Simulate API Data ------------------------------------------ //
const data_ = [
    {'startTime':7.2, 'endTime':9.5, 'customerName':"Mr.A", 'courtName':'court_1'},
    {'startTime':10, 'endTime':12, 'customerName':"Mr.A", 'courtName':'court_2'},
    {'startTime':12, 'endTime':13.5, 'customerName':"Mr.B", 'courtName':'court_1'},
    {'startTime':11, 'endTime':12.5, 'customerName':"Mr.Z", 'courtName':'court_1'},
    {'startTime':15, 'endTime':16, 'customerName':"Mr.B", 'courtName':'court_1'},
    {'startTime':23, 'endTime':24, 'customerName':"Mr.F", 'courtName':'court_2'},
    {'startTime':23.5, 'endTime':24, 'customerName':"Mr.F", 'courtName':'court_1'},
    
    {'startTime':18, 'endTime':22, 'customerName':"Mr.M", 'courtName':'court_2'},
    {'startTime':20.5, 'endTime':22, 'customerName':"Mr.M", 'courtName':'court_3'},
    {'startTime':11, 'endTime':13, 'customerName':"Mr.Z", 'courtName':'court_3'},
    {'startTime':14, 'endTime':15, 'customerName':"Mr.B", 'courtName':'court_3'},
    {'startTime':18, 'endTime':22, 'customerName':"Mr.M", 'courtName':'court_4'},
    ]


data_.forEach( (item, idx) =>{
    chosenCourt = document.querySelector(`div[class="duration-container ${item.courtName}"]`)
    start_time = item.startTime
    end_time = item.endTime
    customer_name = item.customerName
    indexPosition = start_time - startCalendar + 1

    namedPosition = `duration-sub-block ${indexPosition}`
    const currentHourBlock = document.createElement('div')
    currentHourBlock.className = namedPosition
    
    const hasOverlap = data_.some((other, j) => idx !== j && item.courtName === other.courtName && 
                                                isOverlapping(item, other));
    
    calculatePx(currentHourBlock,  customer_name,start_time, end_time)
    
    currentHourBlock.classList.toggle('overlap-block', hasOverlap);
    
    chosenCourt.appendChild(currentHourBlock)
})


// ---------------------------------------------------------------------------------------------------------- //


function createCourtBlock(courtCount, startHour, endHour){
    const hourBars = document.querySelector('#hourBars');
    for (let i = 0; i <= courtCount; i++){
    const courtBlock = document.createElement('div')
    courtBlock.className = `court-block`

    if (i === 0){
        for (let hour = startHour; hour < endHour; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.textContent = `${String(hour).padStart(2,'0')} - ${String(hour + 1).padStart(2,'0')}`
        hourBlock.className = 'time-interval'
        courtBlock.appendChild(hourBlock);
        }
    }
    else{
        courtBlock.id = `court_num_${i}`

        const hourBlockContainer = document.createElement('div')
        const durationContainer = document.createElement('div')

        hourBlockContainer.className = 'hour-container'
        durationContainer.className = `duration-container court_${i}`
        courtBlock.append(hourBlockContainer, durationContainer)

        for (let hour = startHour; hour < endHour; hour++) {
            const idx = hour - startHour  
            const hourBlock = document.createElement('div');
            hourBlock.className = `hour-sub-block ${idx +1}`;
            hourBlockContainer.appendChild(hourBlock)}    
        }

        hourBars.appendChild(courtBlock)}
}


function calculatePx(chosenObject, customerName,startHour, endHour){
    const currentCourt = document.querySelector(".court-block")
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

