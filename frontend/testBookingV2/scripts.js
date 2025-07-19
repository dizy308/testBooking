let input_date = '2025-07-01'

const url = `http://127.0.0.1:8000/apipolls/booking/freeslot?date=${input_date}`
console.log(url)

fetch(url)
  .then(response => {
    if (!response.ok) {
      return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
    }
    return response.json();
  })
  .then(
    returnedData => returnedData.forEach((item, idx)=>{
      booked_slots = item.booked_slot
      empty_slots = item.free_slot
      
      const job1 = () => {
        booked_slots.forEach((elementBooked, idx) => {
        console.log(elementBooked) 
      })}

      const job2 = () => {
        empty_slots.forEach((elementEmpty,idx) =>{
          free_slot_start = elementEmpty[0]
          free_slot_end = elementEmpty[1]
        })
      }

    return Promise.all([Promise.resolve().then(job1), Promise.resolve().then(job2)])
    }))
