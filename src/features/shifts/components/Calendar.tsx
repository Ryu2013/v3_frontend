import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventDropArg, EventClickArg, DayCellContentArg } from '@fullcalendar/core';
import jaLocale from '@fullcalendar/core/locales/ja';
import { fetchShifts, updateShift, fetchNames, fetchShiftTypes } from '../api/shiftApi';
import type { ShiftWithDetails, UserName, ShiftType } from '../types';
import ShiftModal from './ShiftModal';

const Calendar = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [allShifts, setAllShifts] = useState<ShiftWithDetails[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShift, setSelectedShift] = useState<any>(null);

    const [names, setNames] = useState<UserName[]>([]);
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [filterNameId, setFilterNameId] = useState<number | ''>('');
    const [filterShiftTypeId, setFilterShiftTypeId] = useState<number | ''>('');

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([loadShifts(), loadOptions()]);
        };
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allShifts, filterNameId, filterShiftTypeId]);

    const loadOptions = async () => {
        try {
            const [fetchedNames, fetchedShiftTypes] = await Promise.all([fetchNames(), fetchShiftTypes()]);
            setNames(fetchedNames);
            setShiftTypes(fetchedShiftTypes);
        } catch (error) {
            console.error('Failed to load options', error);
        }
    };

    const loadShifts = async () => {
        try {
            const data = await fetchShifts();
            setAllShifts(data);
        } catch (error) {
            console.error('Failed to load shifts', error);
        }
    };

    const applyFilters = () => {
        let filtered = allShifts;

        if (filterNameId) {
            filtered = filtered.filter(shift => shift.name_id === Number(filterNameId));
        }

        if (filterShiftTypeId) {
            filtered = filtered.filter(shift => shift.shift_type_id === Number(filterShiftTypeId));
        }

        const formattedEvents = filtered.map((shift: ShiftWithDetails) => ({
            id: String(shift.id),
            title: `${shift.name?.name || 'Unknown'} - ${shift.shift_type?.shift_type || 'Shift'}`,
            start: shift.date, // assuming date is YYYY-MM-DD
            allDay: true,
            extendedProps: { ...shift }
        }));
        setEvents(formattedEvents);
    };

    const handleEventDrop = async (info: EventDropArg) => {
        const { event } = info;
        const newDate = event.startStr; // YYYY-MM-DD
        const shiftId = Number(event.id);

        try {
            await updateShift(shiftId, { date: newDate });
            loadShifts(); // Reload shifts to update internal state and extendedProps
        } catch (error) {
            console.error('Failed to update shift date', error);
            info.revert();
        }
    };

    const handleDateClick = (arg: { dateStr: string }) => {
        setSelectedDate(arg.dateStr);
        setSelectedShift(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (info: EventClickArg) => {
        const shiftData = info.event.extendedProps;
        setSelectedDate(shiftData.date);
        setSelectedShift(shiftData);
        setIsModalOpen(true);
    };

    const handleShiftSaved = () => {
        loadShifts();
    };

    return (
        <div className='calendar-container'>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '15px' }}>
                <div>
                    <label style={{ marginRight: '5px' }}>名前:</label>
                    <select value={filterNameId} onChange={(e) => setFilterNameId(Number(e.target.value) || '')} style={{ padding: '4px' }}>
                        <option value="">全て</option>
                        {names.map(name => (
                            <option key={name.id} value={name.id}>{name.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ marginRight: '5px' }}>シフト種別:</label>
                    <select value={filterShiftTypeId} onChange={(e) => setFilterShiftTypeId(Number(e.target.value) || '')} style={{ padding: '4px' }}>
                        <option value="">全て</option>
                        {shiftTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.shift_type}</option>
                        ))}
                    </select>
                </div>
            </div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={jaLocale}
                dayCellContent={(e: DayCellContentArg) => e.date.getDate().toString()}
                editable={true}
                events={events}
                eventDrop={handleEventDrop}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                }}
                height="auto"
            />
            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onShiftSaved={handleShiftSaved}
                initialDate={selectedDate}
                initialShift={selectedShift}
            />
        </div>
    );
};

export default Calendar;
