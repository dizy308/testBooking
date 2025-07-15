const startCalendar = 5
const endCalendar  = 24


createCourtBlock(5,startCalendar,endCalendar);

        
// ------------------------------------------ API DATAs ------------------------------------------ //
function fetchDataAPI(input_date){
  const url = `http://127.0.0.1:8000/apipolls/booking/?booking_date=${input_date}`
  fetch(url)
    .then(response => {
        document.querySelectorAll('.duration-container').forEach(container => {container.innerHTML = ''})

      if (!response.ok) {
        return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
      }
      return response.json();
    })
    .then(returnedData => {
      const renderBookedBlocks = () => returnedData.forEach((item,idx)=>{
        chosenCourt = document.querySelector(`div[class="duration-container ${item.courtName}"]`)
        start_time = item.start_time_decimal
        end_time = item.end_time_decimal
        customer_name = item.customer_num
        // indexPosition = start_time - startCalendar + 1
        indexPosition = start_time

        namedPosition = `duration-sub-block ${start_time}-${end_time}`
        const currentHourBlock = document.createElement('div')
        currentHourBlock.className = namedPosition
        
        const hasOverlap = returnedData.some((other, j) => idx !== j && item.courtName === other.courtName && 
                                                    isOverlapping(item, other));
        
        calculatePx(currentHourBlock,  customer_name,start_time, end_time)
        
        currentHourBlock.classList.toggle('overlap-block', hasOverlap);
        
        chosenCourt.appendChild(currentHourBlock)

      })

      const renderEmptyBlocks = () => returnedData.forEach((item,idx)=>{
        console.log(item)
      
      
      
      })
    
    
      return Promise.all([
      Promise.resolve().then(renderBookedBlocks),
      Promise.resolve().then(renderEmptyBlocks),
    ]);


    
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

let currentDate = '2025-07-01'
let refreshInterval = setInterval(() => {
  if (currentDate) {
    fetchDataAPI(currentDate);
  }
}, 10000);

const dateFilter = document.getElementById('date-filter');
dateFilter.addEventListener('change', (e) => {
  clearInterval(refreshInterval);
  
  fetchDataAPI(e.target.value);

  refreshInterval = setInterval(() => {
    fetchDataAPI(e.target.value)}, 10000)
});


// fetchDataAPI('2025-07-01')


// ---------------------------------------------------------------------------------------------------------- //
function createCourtBlock(courtCount, startHour, endHour){
    const hourBars = document.querySelector('#hourBars');
    for (let i = 0; i <= courtCount; i++){
    const courtBlock = document.createElement('div')
    courtBlock.className = `court-block`

    if (i === 0){
        const courtNum = document.createElement('div')
        courtNum.className = `court-number`
        courtNum.textContent = 'COURT NUMBER'
        courtBlock.append(courtNum)

        for (let hour = startHour; hour < endHour; hour++) {
        const hourBlock = document.createElement('div');
        hourBlock.textContent = `${String(hour).padStart(2,'0')} - ${String(hour + 1).padStart(2,'0')}`
        hourBlock.className = 'time-interval'
        courtBlock.append(hourBlock);
        }
    }
    else{
        courtBlock.id = `court_num_${i}`

        const hourBlockContainer = document.createElement('div')
        const durationContainer = document.createElement('div')
        const courtNum = document.createElement('div')

        hourBlockContainer.className = 'hour-container'
        durationContainer.className = `duration-container court_${i}`
        courtNum.className = `court-number`
        courtNum.textContent = `Court ${i}`

        courtBlock.append(courtNum, hourBlockContainer, durationContainer)

        for (let hour = startHour; hour < endHour; hour++) {
            const idx = hour - startHour  
            const hourBlock = document.createElement('div');
            hourBlock.className = `hour-sub-block ${idx +1}`;
            hourBlockContainer.appendChild(hourBlock)}    
        }

        hourBars.appendChild(courtBlock)}
}


function calculatePx(chosenObject, customerName,startHour, endHour){
    const currentCourt = document.querySelector(".hour-container")
    const pxPerDuration = currentCourt.offsetWidth / (60 * (endCalendar - startCalendar))
    const startWidth = (startHour - startCalendar) * 60 * pxPerDuration + currentCourt.offsetLeft

    const currentDuration = endHour - startHour
    const currentDurationLength = (currentDuration * 60 * pxPerDuration)
    
    Object.assign(chosenObject.style, {
        left: `${startWidth}px`,
        width: `${currentDurationLength}px`,
        backgroundColor: "#50C89F",
    });
    chosenObject.textContent = customerName
    
}

function isOverlapping(booking1, booking2) {
    const result = Number(booking1.start_time_decimal) < Number(booking2.end_time_decimal) 
                  && Number(booking2.start_time_decimal) < Number(booking1.end_time_decimal)
    return result;
}

//-------------------------------------Testing Area-------------------------------------//
