import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../lib/prisma.js";
import { EventScopeEnum } from "@prisma/client";

// High-fidelity in-memory tracking of RSVPs (since there is no RSVP join table in the DB schema)
const eventRsvps = new Map<string, Set<string>>(); // eventId -> Set of userIds

export const createEventController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, description, location, eventDate, endDate, scope, tag } = req.body;

    if (!title || !eventDate) {
      res.status(400).json({ message: "title and eventDate are required" });
      return;
    }

    // Fetch user to obtain campus affiliation
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null }
    });

    if (!user) {
      res.status(404).json({ message: "Organizer user not found" });
      return;
    }

    const eventScope = scope === "ALL_NST" ? EventScopeEnum.ALL_NST : EventScopeEnum.CAMPUS_ONLY;
    const campusId = eventScope === EventScopeEnum.CAMPUS_ONLY ? user.primaryCampusId : null;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || "Virtual",
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        scope: eventScope,
        campusId,
        organizerId: userId,
        tag: tag || null,
        rsvpCount: 0
      },
      include: {
        organizer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create event" });
  }
};

export const getEventsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { scope } = req.query; // 'campus', 'global', or 'all'

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const whereClause: any = {
      deletedAt: null
    };

    if (scope === "campus") {
      whereClause.scope = EventScopeEnum.CAMPUS_ONLY;
      whereClause.campusId = user.primaryCampusId;
    } else if (scope === "global") {
      whereClause.scope = EventScopeEnum.ALL_NST;
    } else {
      // 'all' or default: return all global events OR events of user's campus
      whereClause.OR = [
        { scope: EventScopeEnum.ALL_NST },
        {
          scope: EventScopeEnum.CAMPUS_ONLY,
          campusId: user.primaryCampusId
        }
      ];
    }

    const dbEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: { eventDate: "asc" },
      include: {
        organizer: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Attach current RSVP status to returned list
    const enrichedEvents = dbEvents.map(event => {
      const attendees = eventRsvps.get(event.id) || new Set<string>();
      return {
        ...event,
        isRsvped: attendees.has(userId),
        attendeesList: Array.from(attendees)
      };
    });

    res.status(200).json({
      events: enrichedEvents
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch events" });
  }
};

export const rsvpEventController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id, deletedAt: null }
    });

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (!eventRsvps.has(id)) {
      eventRsvps.set(id, new Set<string>());
    }

    const attendees = eventRsvps.get(id)!;
    let attending = false;

    if (attendees.has(userId)) {
      attendees.delete(userId);
      // Decrement RSVP count
      await prisma.event.update({
        where: { id },
        data: { rsvpCount: { decrement: 1 } }
      });
    } else {
      attendees.add(userId);
      attending = true;
      // Increment RSVP count
      await prisma.event.update({
        where: { id },
        data: { rsvpCount: { increment: 1 } }
      });
    }

    res.status(200).json({
      message: attending ? "Successfully RSVP'd to event" : "Successfully cancelled RSVP to event",
      rsvpCount: attendees.size,
      attending
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to process RSVP" });
  }
};
