const axios = require("axios");

exports.handler = async (event) => {
  const {name, slots} = event.currentIntent
  
  
      
  if (!slots.CheckIn)
    return {
        dialogAction: {
            type: "ElicitSlot",
            intentName: name,
            slots,
            slotToElicit: "CheckIn",
        }
    }
  if (!slots.CheckOut)
    return {
        dialogAction: {
            type: "ElicitSlot",
            intentName: name,
            slots,
            slotToElicit: "CheckOut",
        }
    }
  if (slots.CheckOut && slots.CheckIn) {
    const hotels = await getHotel(slots.CheckIn, slots.CheckOut)
    
    if (hotels && hotels.result && hotels.result.length >= 3) {
      
    const hotelInfo = hotels.result
    return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: `There is 3 available places around here.\n ${hotelInfo[0].hotel_name}: ${hotelInfo[0].min_total_price}€\n ${hotelInfo[1].hotel_name}: ${hotelInfo[1].min_total_price}€\n ${hotelInfo[2].hotel_name}: ${hotelInfo[2].min_total_price}€\n` 
                }
            }
        }
    }
    return {
            dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
                message: {
                    contentType: "PlainText",
                    content: `No places available for this dates.` 
                }
            }
        }
  }
  return {
        dialogAction: {
            type: "Delegate",
            slots
        }
    }
};

const getHotel = async (inDate, outDate) => {
  var options = {
  method: 'GET',
  url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
  params: {
    room_number: '1',
    order_by: 'popularity',
    filter_by_currency: 'EUR',
    checkout_date: outDate,
    checkin_date: inDate,
    units: 'metric',
    adults_number: '1',
    dest_id: '-372490',
    dest_type: 'city',
    locale: 'en-gb',
    children_ages: '0',
    page_number: '0',
    include_adjacency: 'true',
    categories_filter_ids: 'class::2,class::4,free_cancellation::1'
  },
  headers: {
    'x-rapidapi-host': 'booking-com.p.rapidapi.com',
    'x-rapidapi-key': 'f1e3184210msh17a67e5cf038c7cp1101c9jsn873ed9f2feb3'
  }
};
  return await axios.request(options).then((data) => data.data).catch((err) => err);
} 
