var express = require("express");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");
uuidv4();

let rooms = [];
let roomNo = 100;
let bookings = [];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

router.get("/", function (request, response) {
  response.status(200).send({
    output: "Homepage",
  });
});

router.get("/getAllRooms", function (request, response) {
  if (rooms.length) {
    response.status(200).send({
      output: rooms,
    });
  } else {
    response.status(200).send({
      message: "No rooms created",
    });
  }
});

// Get All Customers list with Booked Data
router.get("/getAllBookings", function (request, response) {
  if (bookings.length) {
    response.status(200).send({
      output: bookings,
    });
  } else {
    response.status(200).send({
      message: "No bookings available",
    });
  }
});

// Get All Rooms list with Booked Data
router.get("/getRoomBookings", function (request, response) {
  if (rooms.length) {
    const roomsList = rooms.map((room) => ({
      roomNo: room.roomNo,
      bookings: room.bookings,
    }));
    response.status(200).send({
      output: roomsList,
    });
  } else {
    response.status(200).send({
      message: "No rooms created",
    });
  }
});

// Get All Customers list with Booked Data
router.get("/getAllBookings", function (request, response) {
  if (bookings.length) {
    response.status(200).send({
      output: bookings,
    });
  } else {
    response.status(200).send({
      message: "No bookings available",
    });
  }
});

// Get All Rooms list with Booked Data
router.get("/getRoomBookings", function (request, response) {
  if (rooms.length) {
    const roomsList = rooms.map((room) => ({
      roomNo: room.roomNo,
      bookings: room.bookings,
    }));
    response.status(200).send({
      output: roomsList,
    });
  } else {
    response.status(200).send({
      message: "No rooms created",
    });
  }
});

// Create Room--------------
router.post("/createRoom", function (request, response) {
  let room = {};
  room.id = uniqid();
  room.roomNo = roomNo;
  room.bookings = [];
  let isCorrect = true;

  if (request.body.noSeats) {
    if (!Number.isInteger(request.body.noSeats)) {
      response
        .status(400)
        .send({ output: "Enter only integer values for Number of Seats" });
      isCorrect = false;
      return;
    }
  } else {
    response
      .status(400)
      .send({ output: "Please specify No of seats for Room" });
    isCorrect = false;
    return;
  }
  if (request.body.amenities) {
    if (!Array.isArray(request.body.amenities)) {
      response
        .status(400)
        .send({ output: "Amenities list accepts only array of strings" });
      isCorrect = false;
      return;
    }
  } else {
    response.status(400).send({
      output: "Please specify all Amenities for Room in Array format",
    });
    isCorrect = false;
    return;
  }
  if (request.body.pricePerHour) {
    if (isNaN(request.body.pricePerHour)) {
      response
        .status(400)
        .send({ output: "Enter only digits for Price per Hour" });
      isCorrect = false;
      return;
    }
  } else {
    response
      .status(400)
      .send({ output: "Please specify price per hour for Room" });
    isCorrect = false;
    return;
  }

  if (isCorrect) {
    room.noSeats = request.body.noSeats;
    room.amenities = request.body.amenities;
    room.pricePerHour = request.body.pricePerHour;
    rooms.push(room);
    roomNo++;
    response.status(200).send({ output: "Room Created Successfully" });
  }
});

// Create Booking-----------------------------
router.post("/createBooking", function (request, response) {
  let isCorrect = true;
  let checkRoom = [];

  if (rooms.length) {
    if (request.body.roomNo) {
      if (Number.isInteger(request.body.roomNo)) {
        checkRoom = rooms.filter((room) => room.roomNo === request.body.roomNo);
        if (!checkRoom.length) {
          response.status(400).send({
            output: `No room available with room ${request.body.roomNo} for booking`,
          });
          return;
        }
      } else {
        response
          .status(400)
          .send({ output: "Enter only integer values for Room Number" });
        isCorrect = false;
        return;
      }
    } else {
      response.status(400).send({
        output: `Please specify a Room Number(field: "roomNo") for booking`,
      });
      isCorrect = false;
      return;
    }

    if (!request.body.custName) {
      response
        .status(400)
        .send({ output: "Please specify customer Name for booking" });
      isCorrect = false;
      return;
    }

    if (request.body.date) {
      if (!date_regex.test(request.body.date)) {
        response
          .status(400)
          .send({ output: "Please specify date in MM/DD/YYYY" });
        isCorrect = false;
        return;
      }
    } else {
      response.status(400).send({ output: "Please specify date for booking." });
      isCorrect = false;
      return;
    }

    if (request.body.startTime) {
      if (time_regex.test(request.body.startTime)) {
        let dateTime = `${request.body.date.substring(
          6
        )}-${request.body.date.substring(0, 2)}-${request.body.date.substring(
          3,
          5
        )}`;
        const currentDateTime = new Date(new Date().toString()).getTime();
        dateTime = new Date(
          new Date(`${dateTime}T${request.body.startTime}`).toString()
        ).getTime();

        if (dateTime < currentDateTime) {
          response.status(400).send({
            output:
              "Please specify a current or future date and time for booking.",
          });
          isCorrect = false;
          return;
        }
      } else {
        response.status(400).send({
          output:
            "Please specify time in hh:min(24-hr format) where minutes should be 00 only",
        });
        isCorrect = false;
        return;
      }
    } else {
      response
        .status(400)
        .send({ output: "Please specify Starting time for booking." });
      isCorrect = false;
      return;
    }

    if (request.body.endTime) {
      if (time_regex.test(request.body.endTime)) {
        if (
          parseInt(request.body.startTime.substring(0, 2)) >=
          parseInt(request.body.endTime.substring(0, 2))
        ) {
          response.status(400).send({
            output: "End time must be greater than Start time",
          });
          isCorrect = false;
          return;
        }
      } else {
        response.status(400).send({
          output:
            "Please specify time in hh:min(24-hr format) where minutes should be 00 only",
        });
        isCorrect = false;
        return;
      }
    } else {
      response
        .status(400)
        .send({ output: "Please specify Ending time for booking." });
      isCorrect = false;
      return;
    }

    let isAvailable = false;
    if (checkRoom[0].bookings.length) {
      const sameDateBookings = checkRoom[0].bookings.filter(
        (book) => book.date === request.body.date && book.bookingStatus === true
      );

      if (sameDateBookings.length) {
        let isTimeAvailable = true;

        sameDateBookings.map((book) => {
          if (
            !(
              (parseInt(book.startTime.substring(0, 2)) >
                parseInt(request.body.startTime.substring(0, 2)) &&
                parseInt(book.startTime.substring(0, 2)) >=
                  parseInt(request.body.endTime.substring(0, 2))) ||
              (parseInt(book.endTime.substring(0, 2)) <=
                parseInt(request.body.startTime.substring(0, 2)) &&
                parseInt(book.endTime.substring(0, 2)) <
                  parseInt(request.body.endTime.substring(0, 2)))
            )
          ) {
            isTimeAvailable = false;
          }
        });

        if (isTimeAvailable) {
          isAvailable = true;
        }
      } else {
        isAvailable = true;
      }
    } else {
      isAvailable = true;
    }

    if (!isAvailable) {
      response.status(400).send({
        output: `Room ${request.body.roomNo} is not available on Selected Date and Time`,
      });
      return;
    } else {
      if (isCorrect) {
        let count = 0;
        rooms.forEach((element) => {
          if (element.roomNo === request.body.roomNo) {
            rooms[count].bookings.push({
              id: uniqid(),
              custName: request.body.custName,
              bookingStatus: true,
              date: request.body.date,
              startTime: request.body.startTime,
              endTime: request.body.endTime,
            });
          }
          count++;
        });

        let bookingRec = request.body;
        bookingRec.cost =
          checkRoom[0].pricePerHour *
          (parseInt(bookingRec.endTime.substring(0, 2)) -
            parseInt(bookingRec.startTime.substring(0, 2)));

        bookings.push(bookingRec);
        response.status(200).send({ output: "Room Booking Successfully" });
      } else {
        response.status(400).send({ output: "Error in entered data" });
        return;
      }
    }
  } else {
    response.status(400).send({ output: "No rooms created for booking" });
    return;
  }
});

module.exports = router;
