"use strict";

var express = require('express');

var router = express.Router();

var _require = require('./../controllers/eventController'),
    createEvent = _require.createEvent,
    getEvents = _require.getEvents;

router.post('/create', createEvent);
router.get('/', getEvents);
module.exports = router;