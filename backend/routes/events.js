const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const Event = require('../models/Event');
const router = express.Router();

const transformEvent = (event) => ({ ...event });

const validateTicketCategories = (ticketCategories) => {
  if (!Array.isArray(ticketCategories) || ticketCategories.length === 0) return 'At least one ticket category is required';
  for (const ticketCategory of ticketCategories) {
    if (!ticketCategory.name || ticketCategory.price === undefined || !ticketCategory.currency || ticketCategory.available === undefined) {
      return 'Invalid ticket category structure';
    }
  }
  return null;
};

const validateCoordinates = (coordinates) => {
  if (!coordinates || coordinates.lat === undefined || coordinates.lng === undefined) return 'Coordinates must include lat and lng';
  return null;
};

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, date, time, location, city, country, ticketCategories, category, imageUrl, organizer, featured, coordinates } = req.body;
    if (!title || !description || !date || !time || !location || !city || !country || !ticketCategories || !category || !imageUrl || !organizer) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const ticketCategoryError = validateTicketCategories(ticketCategories);
    if (ticketCategoryError) return res.status(400).json({ success: false, message: ticketCategoryError });
    const coordinatesError = validateCoordinates(coordinates);
    if (coordinatesError) return res.status(400).json({ success: false, message: coordinatesError });

    const event = await Event.create({ title: title.trim(), description: description.trim(), date, time, location: location.trim(), city: city.trim(), country: country.trim(), ticketCategories, category: category.trim(), imageUrl: imageUrl.trim(), organizer: organizer.trim(), featured: !!featured, coordinates, createdBy: req.user.id, status: 'active' });
    res.status(201).json({ success: true, message: 'Event created successfully', data: { event: transformEvent(event) } });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/mine', requireAdmin, async (req, res) => {
  try {
    const events = await Event.findMine(req.user.id);
    res.json({ success: true, data: { events: events.map(transformEvent) } });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await Event.search(req.query);
    res.json({ success: true, data: { ...data, events: data.events.map(transformEvent) } });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own events' });
    }
    if (req.body.ticketCategories) {
      const err = validateTicketCategories(req.body.ticketCategories);
      if (err) return res.status(400).json({ success: false, message: err });
    }
    if (req.body.coordinates) {
      const err = validateCoordinates(req.body.coordinates);
      if (err) return res.status(400).json({ success: false, message: err });
    }
    Object.assign(event, req.body);
    const updated = await event.save();
    res.json({ success: true, message: 'Event updated successfully', data: { event: transformEvent(updated) } });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only cancel your own events' });
    }
    event.status = 'cancelled';
    await event.save();
    res.json({ success: true, message: 'Event cancelled successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/categories', async (req, res) => {
  try { res.json({ success: true, data: { categories: await Event.distinct('category') } }); }
  catch (error) { console.error('Get categories error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});
router.get('/cities', async (req, res) => {
  try { res.json({ success: true, data: { cities: await Event.distinct('city') } }); }
  catch (error) { console.error('Get cities error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});
router.get('/countries', async (req, res) => {
  try { res.json({ success: true, data: { countries: await Event.distinct('country') } }); }
  catch (error) { console.error('Get countries error:', error); res.status(500).json({ success: false, message: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: { event: transformEvent(event) } });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
