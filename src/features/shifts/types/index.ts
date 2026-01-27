export interface Shift {
    id: number;
    date: string;
    starttime: string;
    endtime: string;
    shift_type_id: number;
    name_id: number;
}

export interface ShiftType {
    id: number;
    shift_type: string;
}

export interface UserName {
    id: number;
    name: string;
}

export interface ShiftWithDetails extends Shift {
    shift_type?: ShiftType;
    name?: UserName;
}
