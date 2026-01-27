import React, { useState, useEffect } from 'react';
import { createShift, updateShift, deleteShift, fetchShiftTypes, fetchNames, createName, createShiftType, deleteName, deleteShiftType } from '../api/shiftApi';
import type { ShiftType, UserName, Shift } from '../types';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShiftSaved: () => void;
    initialDate: string;
    initialShift?: Shift | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onShiftSaved, initialDate, initialShift }) => {
    const [date, setDate] = useState(initialDate);
    const [starttime, setStarttime] = useState('');
    const [endtime, setEndtime] = useState('');
    const [shiftTypeId, setShiftTypeId] = useState<number | ''>('');
    const [nameId, setNameId] = useState<number | ''>('');
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [names, setNames] = useState<UserName[]>([]);

    const [isAddingName, setIsAddingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [isAddingShiftType, setIsAddingShiftType] = useState(false);
    const [newShiftType, setNewShiftType] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadOptions();
            if (initialShift) {
                setDate(initialShift.date);
                // Extract time part if necessary or assume format HH:MM
                setStarttime(initialShift.starttime ? initialShift.starttime.substring(0, 5) : '');
                setEndtime(initialShift.endtime ? initialShift.endtime.substring(0, 5) : '');
                setShiftTypeId(initialShift.shift_type_id);
                setNameId(initialShift.name_id);
            } else {
                setDate(initialDate);
                setStarttime('');
                setEndtime('');
                setShiftTypeId('');
                setNameId('');
            }
        }
    }, [isOpen, initialDate, initialShift]);

    const loadOptions = async () => {
        try {
            const [types, userNames] = await Promise.all([fetchShiftTypes(), fetchNames()]);
            setShiftTypes(types);
            setNames(userNames);
        } catch (error) {
            console.error("Failed to load options", error);
        }
    };

    const handleAddName = async () => {
        if (!newName) return;
        try {
            const addedName = await createName(newName);
            setNames([...names, addedName]);
            setNameId(addedName.id);
            setIsAddingName(false);
            setNewName('');
        } catch (error) {
            console.error('Failed to create name', error);
            alert('Failed to create name');
        }
    };

    const handleDeleteName = async () => {
        if (!nameId) return;
        if (!window.confirm('選択中の名前を削除しますか？\n(注意: 使用中の場合は削除できない可能性があります)')) return;
        try {
            await deleteName(Number(nameId));
            setNames(names.filter(n => n.id !== nameId));
            setNameId('');
        } catch (error) {
            console.error('Failed to delete name', error);
            alert('名削除に失敗しました。使用中の可能性があります。');
        }
    };

    const handleAddShiftType = async () => {
        if (!newShiftType) return;
        try {
            const addedType = await createShiftType(newShiftType);
            setShiftTypes([...shiftTypes, addedType]);
            setShiftTypeId(addedType.id);
            setIsAddingShiftType(false);
            setNewShiftType('');
        } catch (error) {
            console.error('Failed to create shift type', error);
            alert('Failed to create shift type');
        }
    };

    const handleDeleteShiftType = async () => {
        if (!shiftTypeId) return;
        if (!window.confirm('選択中のシフト種別を削除しますか？\n(注意: 使用中の場合は削除できない可能性があります)')) return;
        try {
            await deleteShiftType(Number(shiftTypeId));
            setShiftTypes(shiftTypes.filter(t => t.id !== shiftTypeId));
            setShiftTypeId('');
        } catch (error) {
            console.error('Failed to delete shift type', error);
            alert('シフト種別の削除に失敗しました。使用中の可能性があります。');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const shiftData = {
                date,
                starttime,
                endtime,
                shift_type_id: Number(shiftTypeId),
                name_id: Number(nameId),
            };

            if (initialShift) {
                await updateShift(initialShift.id, shiftData);
            } else {
                await createShift(shiftData as any);
            }
            onShiftSaved();
            onClose();
        } catch (error) {
            console.error('Failed to save shift', error);
            alert('Failed to save shift');
        }
    };

    const handleDelete = async () => {
        if (!initialShift || !window.confirm('本当に削除しますか？')) return;
        try {
            await deleteShift(initialShift.id);
            onShiftSaved();
            onClose();
        } catch (error) {
            console.error('Failed to delete shift', error);
            alert('Failed to delete shift');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%'
            }}>
                <h2>{initialShift ? 'シフト編集' : '新規シフト作成'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>日付:</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>名前:</label>
                        {!isAddingName ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select value={nameId} onChange={(e) => setNameId(Number(e.target.value))} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="">選択してください</option>
                                    {names.map(name => (
                                        <option key={name.id} value={name.id}>{name.name}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setIsAddingName(true)} style={{ padding: '8px' }}>新規</button>
                                <button type="button" onClick={handleDeleteName} disabled={!nameId} style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: nameId ? 'pointer' : 'default', opacity: nameId ? 1 : 0.5 }}>削除</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="新しい名前を入力"
                                    style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
                                />
                                <button type="button" onClick={handleAddName} style={{ padding: '8px' }}>追加</button>
                                <button type="button" onClick={() => setIsAddingName(false)} style={{ padding: '8px' }}>戻る</button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>シフト種別:</label>
                        {!isAddingShiftType ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select value={shiftTypeId} onChange={(e) => setShiftTypeId(Number(e.target.value))} required style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}>
                                    <option value="">選択してください</option>
                                    {shiftTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.shift_type}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setIsAddingShiftType(true)} style={{ padding: '8px' }}>新規</button>
                                <button type="button" onClick={handleDeleteShiftType} disabled={!shiftTypeId} style={{ padding: '8px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: shiftTypeId ? 'pointer' : 'default', opacity: shiftTypeId ? 1 : 0.5 }}>削除</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newShiftType}
                                    onChange={(e) => setNewShiftType(e.target.value)}
                                    placeholder="新しいシフト種別を入力"
                                    style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
                                />
                                <button type="button" onClick={handleAddShiftType} style={{ padding: '8px' }}>追加</button>
                                <button type="button" onClick={() => setIsAddingShiftType(false)} style={{ padding: '8px' }}>戻る</button>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>開始時間:</label>
                        <input type="time" value={starttime} onChange={(e) => setStarttime(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>終了時間:</label>
                        <input type="time" value={endtime} onChange={(e) => setEndtime(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {initialShift && (
                            <button type="button" onClick={handleDelete} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: 'auto' }}>削除</button>
                        )}
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>キャンセル</button>
                        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>保存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftModal;
