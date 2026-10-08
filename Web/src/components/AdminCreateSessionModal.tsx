import { useMemo, useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { X, Calendar as CalendarIcon, Clock3, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CREATE_SESSION, GET_USERS } from '@/graphql/operations/index';
import type { GetUsersQuery } from '@/graphql/generated/graphql';
import { RoleType, SessionKind, TransactionStatus } from '@/graphql/generated/graphql';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const WEEKDAY_VALUES = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
] as const;
type WeekdayValue = (typeof WEEKDAY_VALUES)[number];
const WEEKDAY_OPTIONS: { label: string; value: WeekdayValue }[] = [
	{ label: 'Monday', value: 'monday' },
	{ label: 'Tuesday', value: 'tuesday' },
	{ label: 'Wednesday', value: 'wednesday' },
	{ label: 'Thursday', value: 'thursday' },
	{ label: 'Friday', value: 'friday' },
	{ label: 'Saturday', value: 'saturday' },
	{ label: 'Sunday', value: 'sunday' },
];
const SCHEDULE_PRESETS: { label: string; days: WeekdayValue[] }[] = [
	{ label: 'M-W-F', days: ['monday', 'wednesday', 'friday'] },
	{ label: 'T-TH-S', days: ['tuesday', 'thursday', 'saturday'] },
	{ label: 'Weekdays', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
	{ label: 'Daily', days: [...WEEKDAY_VALUES] },
];
const GYM_AREAS = [
	{ label: 'Main Training Area', value: 'Main Training Area' },
	{ label: 'Cardio Zone', value: 'Cardio Zone' },
	{ label: 'Free Weights Area', value: 'Free Weights Area' },
];

const GET_EQUIPMENTS_FOR_SESSION_WINDOW = gql`
	query GetEquipmentsForSessionWindow(
		$includeArchived: Boolean
		$checkDate: String
		$checkStartTime: String
		$checkEndTime: String
	) {
		getEquipments(
			includeArchived: $includeArchived
			checkDate: $checkDate
			checkStartTime: $checkStartTime
			checkEndTime: $checkEndTime
		) {
			id
			name
			status
			quantity
			isReservedInWindow
			reservedQuantityInWindow
		}
	}
`;

function sessionCalendarDateToIso(d: Date): string {
	const y = d.getFullYear();
	const m = d.getMonth();
	const day = d.getDate();
	return new Date(Date.UTC(y, m, day, 12, 0, 0, 0)).toISOString();
}

function formatTimeToString(time: Date): string {
	const hours = time.getHours();
	const minutes = time.getMinutes();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	const displayMinutes = minutes.toString().padStart(2, '0');
	return `${displayHours}:${displayMinutes} ${ampm}`;
}

function parseTimeInputToDate(timeVal: string): Date | undefined {
	if (!timeVal || !timeVal.includes(':')) return undefined;
	const [h, m] = timeVal.split(':').map((x) => parseInt(x, 10));
	if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
	return new Date(2000, 0, 1, h, m, 0, 0);
}

type Meridiem = 'am' | 'pm';

function parse24HourTime(timeVal: string): { hour12: number; minute: number; meridiem: Meridiem } {
	const [rawH, rawM] = timeVal.split(':').map((x) => parseInt(x, 10));
	const hour = Number.isNaN(rawH) ? 9 : rawH;
	const minute = Number.isNaN(rawM) ? 0 : rawM;
	const meridiem: Meridiem = hour >= 12 ? 'pm' : 'am';
	const hour12 = hour % 12 || 12;
	return { hour12, minute, meridiem };
}

function to24HourString(hour12: number, minute: number, meridiem: Meridiem): string {
	const base = hour12 % 12;
	const hour24 = meridiem === 'pm' ? base + 12 : base;
	return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function formatDisplayTime(timeVal: string): string {
	const parsed = parseTimeInputToDate(timeVal);
	if (!parsed) return '--:-- --';
	return formatTimeToString(parsed).toLowerCase();
}

type CustomTimePickerProps = {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	min?: string;
};

function CustomTimePicker({ id, label, value, onChange, required, min }: CustomTimePickerProps) {
	const [open, setOpen] = useState(false);
	const parsed = parse24HourTime(value || '09:00');
	const hours = Array.from({ length: 12 }, (_, i) => i + 1);
	const minutes = Array.from({ length: 60 }, (_, i) => i);
	const minTime = min && min.trim() ? min : null;

	const apply = (hour12: number, minute: number, meridiem: Meridiem) => {
		const next = to24HourString(hour12, minute, meridiem);
		if (minTime && next <= minTime) {
			onChange(minTime);
			return;
		}
		onChange(next);
	};

	return (
		<div className="form-group">
			<label htmlFor={id}>
				{label} {required ? <span className="required">*</span> : null}
			</label>
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<button
						id={id}
						type="button"
						className="w-full flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
					>
						<Clock3 className="h-4 w-4 text-[var(--text-secondary)]" />
						<span className={cn('flex-1 text-left', value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
							{value ? formatDisplayTime(value) : '--:-- --'}
						</span>
						<ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-[260px] p-3" align="start" style={{ zIndex: 9999 }}>
					<div className="grid grid-cols-3 gap-2">
						<select
							aria-label={`${label} hour`}
							title={`${label} hour`}
							value={parsed.hour12}
							onChange={(e) => apply(parseInt(e.target.value, 10), parsed.minute, parsed.meridiem)}
							className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-2 text-sm"
						>
							{hours.map((h) => (
								<option key={h} value={h}>
									{h.toString().padStart(2, '0')}
								</option>
							))}
						</select>
						<select
							aria-label={`${label} minute`}
							title={`${label} minute`}
							value={parsed.minute}
							onChange={(e) => apply(parsed.hour12, parseInt(e.target.value, 10), parsed.meridiem)}
							className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-2 text-sm"
						>
							{minutes.map((m) => (
								<option key={m} value={m}>
									{m.toString().padStart(2, '0')}
								</option>
							))}
						</select>
						<select
							aria-label={`${label} meridiem`}
							title={`${label} meridiem`}
							value={parsed.meridiem}
							onChange={(e) => apply(parsed.hour12, parsed.minute, e.target.value as Meridiem)}
							className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-2 text-sm"
						>
							<option value="am">AM</option>
							<option value="pm">PM</option>
						</select>
					</div>
					<div className="mt-2 flex justify-end">
						<Button type="button" size="sm" onClick={() => setOpen(false)}>
							Done
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function memberHasActiveSubscription(
	u: NonNullable<NonNullable<GetUsersQuery['getUsers']>[number]>
): boolean {
	const cm = u.currentMembership;
	if (!cm) return false;
	if (cm.status !== TransactionStatus.Active) return false;
	const exp = new Date(cm.expiresAt);
	return Number.isFinite(exp.getTime()) && exp > new Date();
}

function areSameWeekdaySet(a: WeekdayValue[], b: WeekdayValue[]): boolean {
	if (a.length !== b.length) return false;
	const setA = new Set(a);
	return b.every((d) => setA.has(d));
}

export type AdminCoachOption = { id: string; name: string };

type Props = {
	isOpen: boolean;
	onClose: () => void;
	coaches: AdminCoachOption[];
	onCreated?: () => void;
};

export function AdminCreateSessionModal({
	isOpen,
	onClose,
	coaches,
	onCreated,
}: Props) {
	const [coachId, setCoachId] = useState('');
	const [memberSearch, setMemberSearch] = useState('');
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [sessionName, setSessionName] = useState('');
	const [date, setDate] = useState<Date | undefined>();
	const [startTimeStr, setStartTimeStr] = useState('');
	const [endTimeStr, setEndTimeStr] = useState('');
	const [gymArea, setGymArea] = useState('');
	const [scheduleDays, setScheduleDays] = useState<WeekdayValue[]>(['monday', 'wednesday', 'friday']);
	const [note, setNote] = useState('');
	const [isGroupClass, setIsGroupClass] = useState(false);
	const [maxParticipants, setMaxParticipants] = useState('20');
	const [equipmentPickerValue, setEquipmentPickerValue] = useState('');
	const [manualEquipmentSelections, setManualEquipmentSelections] = useState<
		{ equipmentId: string; quantity: number }[]
	>([]);
	const [formError, setFormError] = useState('');

	const { data: membersData } = useQuery(GET_USERS, {
		variables: { role: RoleType.Member, includeDisabled: false },
		skip: !isOpen,
	});
	const hasReservationWindow = !!date && !!startTimeStr.trim();
	const checkStartTime = startTimeStr.trim()
		? formatTimeToString(parseTimeInputToDate(startTimeStr) || new Date(2000, 0, 1, 9, 0))
		: undefined;
	const checkEndTime = endTimeStr.trim()
		? formatTimeToString(parseTimeInputToDate(endTimeStr) || new Date(2000, 0, 1, 10, 0))
		: checkStartTime;
	const { data: equipmentsData } = useQuery(GET_EQUIPMENTS_FOR_SESSION_WINDOW, {
		variables: {
			includeArchived: false,
			checkDate: hasReservationWindow && date ? sessionCalendarDateToIso(date) : undefined,
			checkStartTime: hasReservationWindow ? checkStartTime : undefined,
			checkEndTime: hasReservationWindow ? checkEndTime : undefined,
		},
		skip: !isOpen,
	});

	const resetForm = () => {
		setCoachId('');
		setMemberSearch('');
		setSelectedMemberIds([]);
		setSessionName('');
		setDate(undefined);
		setStartTimeStr('');
		setEndTimeStr('');
		setGymArea('');
		setScheduleDays(['monday', 'wednesday', 'friday']);
		setNote('');
		setIsGroupClass(false);
		setMaxParticipants('20');
		setEquipmentPickerValue('');
		setManualEquipmentSelections([]);
		setFormError('');
	};

	const equipmentOptions = useMemo(() => {
		const rows = (equipmentsData?.getEquipments || []) as any[];
		return rows
			.filter((x) => x?.id && x?.name)
			.map((x) => {
				const status = String(x.status || 'AVAILABLE').toUpperCase();
				const quantity = Math.max(0, Number(x.quantity || 0));
				const reserved = hasReservationWindow
					? Math.max(0, Number(x.reservedQuantityInWindow || 0))
					: 0;
				const availableUnits = Math.max(0, quantity - reserved);
				const unavailableByStatus =
					status === 'UNDERMAINTENANCE' || status === 'DAMAGED';
				const unavailableByWindow = hasReservationWindow && reserved > 0 && availableUnits <= 0;
				const selectable = !unavailableByStatus && quantity > 0 && !unavailableByWindow;
				const rightText = unavailableByStatus
					? status === 'UNDERMAINTENANCE'
						? 'Maintenance'
						: 'Damaged'
					: unavailableByWindow
						? 'In Use'
						: hasReservationWindow && reserved > 0
							? `${availableUnits}/${quantity}`
							: `${quantity}/${quantity}`;
				return {
					id: String(x.id),
					name: String(x.name),
					quantity,
					status,
					selectable,
					rightText,
				};
			})
			.sort((a, b) => {
				const aRank = a.selectable ? 0 : 1;
				const bRank = b.selectable ? 0 : 1;
				if (aRank !== bRank) return aRank - bRank;
				return a.name.localeCompare(b.name);
			});
	}, [equipmentsData?.getEquipments, hasReservationWindow]);

	const equipmentById = useMemo(
		() => new Map(equipmentOptions.map((eq) => [eq.id, eq])),
		[equipmentOptions]
	);

	const availableEquipmentOptions = useMemo(() => {
		const selectedIds = new Set(manualEquipmentSelections.map((x) => x.equipmentId));
		return equipmentOptions.filter((eq) => !selectedIds.has(eq.id));
	}, [equipmentOptions, manualEquipmentSelections]);

	const addEquipment = (equipmentId: string) => {
		if (!equipmentId) return;
		const target = equipmentById.get(equipmentId);
		if (!target) return;
		if (!target.selectable) {
			setFormError(`${target.name} is currently unavailable (${target.rightText}).`);
			setEquipmentPickerValue('');
			return;
		}
		setManualEquipmentSelections((prev) =>
			prev.some((x) => x.equipmentId === equipmentId)
				? prev
				: [...prev, { equipmentId, quantity: 1 }]
		);
		setEquipmentPickerValue('');
	};

	const removeEquipment = (equipmentId: string) => {
		setManualEquipmentSelections((prev) =>
			prev.filter((x) => x.equipmentId !== equipmentId)
		);
	};

	const updateEquipmentQty = (equipmentId: string, quantityRaw: string) => {
		const clean = Math.max(1, Number.parseInt(quantityRaw || '1', 10) || 1);
		setManualEquipmentSelections((prev) =>
			prev.map((x) => (x.equipmentId === equipmentId ? { ...x, quantity: clean } : x))
		);
	};

	const [createSession, { loading: submitting }] = useMutation(CREATE_SESSION, {
		onCompleted: () => {
			onCreated?.();
			resetForm();
			onClose();
		},
		onError: (e) => {
			setFormError(e.message || 'Failed to create session');
		},
	});

	const membersWithMembership = useMemo(() => {
		const list = membersData?.getUsers ?? [];
		return list.filter(
			(u): u is NonNullable<typeof u> =>
				u != null && memberHasActiveSubscription(u)
		);
	}, [membersData?.getUsers]);

	const filteredMembers = useMemo(() => {
		const q = memberSearch.trim().toLowerCase();
		if (!q) return membersWithMembership;
		return membersWithMembership.filter((u) => {
			const name = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ').toLowerCase();
			return (
				name.includes(q) ||
				u.email.toLowerCase().includes(q) ||
				u.id.toLowerCase().includes(q)
			);
		});
	}, [memberSearch, membersWithMembership]);

	useEffect(() => {
		if (!isOpen) return;
		setFormError('');
	}, [isOpen]);

	const toggleMember = (id: string) => {
		setSelectedMemberIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);
	};

	const toggleScheduleDay = (day: WeekdayValue) => {
		setScheduleDays((prev) => {
			return prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
		});
	};

	const applySchedulePreset = (days: WeekdayValue[]) => {
		setScheduleDays(days);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError('');
		if (!coachId) {
			setFormError('Select a coach.');
			return;
		}
		if (!sessionName.trim()) {
			setFormError('Workout name is required.');
			return;
		}
		if (!date) {
			setFormError('Date is required.');
			return;
		}
		const startD = parseTimeInputToDate(startTimeStr);
		if (!startD) {
			setFormError('Start time is required.');
			return;
		}
		const startTimeString = formatTimeToString(startD);
		let endTimeString: string | undefined;
		if (endTimeStr.trim()) {
			const endD = parseTimeInputToDate(endTimeStr);
			if (!endD) {
				setFormError('Invalid end time.');
				return;
			}
			if (endD <= startD) {
				setFormError('End time must be later than start time.');
				return;
			}
			endTimeString = formatTimeToString(endD);
		}
		if (!gymArea) {
			setFormError('Gym area is required.');
			return;
		}
		const normalizedScheduleDays = scheduleDays;
		if (normalizedScheduleDays.length === 0) {
			setFormError('Select schedule day(s).');
			return;
		}

		if (isGroupClass) {
			const mp = parseInt(maxParticipants, 10);
			if (!mp || mp < 1) {
				setFormError('Enter a valid max participants (at least 1).');
				return;
			}
			await createSession({
				variables: {
					input: {
						coachId,
						name: sessionName.trim(),
						date: sessionCalendarDateToIso(date),
						startTime: startTimeString,
						endTime: endTimeString,
						gymArea,
						scheduleDays: normalizedScheduleDays,
						note: note.trim() || undefined,
						sessionKind: SessionKind.GroupClass,
						maxParticipants: mp,
						invitedClientIds:
							selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
						equipmentReservations:
							manualEquipmentSelections.length > 0
								? manualEquipmentSelections.map((row) => ({
										equipmentId: row.equipmentId,
										quantity: row.quantity,
										reservedStartTime: startTimeString,
										reservedEndTime: endTimeString,
								  }))
								: undefined,
					} as any,
				},
			});
			return;
		}

		if (selectedMemberIds.length === 0) {
			setFormError('Select at least one member with an active membership.');
			return;
		}

		await createSession({
			variables: {
				input: {
					coachId,
					clientsIds: selectedMemberIds,
					name: sessionName.trim(),
					date: sessionCalendarDateToIso(date),
					startTime: startTimeString,
					endTime: endTimeString,
					gymArea,
					scheduleDays: normalizedScheduleDays,
					note: note.trim() || undefined,
					sessionKind: SessionKind.Personal,
					equipmentReservations:
						manualEquipmentSelections.length > 0
							? manualEquipmentSelections.map((row) => ({
									equipmentId: row.equipmentId,
									quantity: row.quantity,
									reservedStartTime: startTimeString,
									reservedEndTime: endTimeString,
							  }))
							: undefined,
				} as any,
			},
		});
	};

	const handleClose = () => {
		if (submitting) return;
		resetForm();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div
			className="modal modal-large admin-session-modal"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="modal-header admin-session-modal-header">
				<h3>
					<CalendarIcon className="w-5 h-5" />
					Create session
				</h3>
				<button
					type="button"
					className="modal-close"
					onClick={handleClose}
					title="Close"
					aria-label="Close"
					disabled={submitting}
				>
					<X className="w-5 h-5" />
				</button>
			</div>
			<form onSubmit={handleSubmit} className="admin-session-modal-form">
				<div className="modal-body admin-session-modal-body">
					{formError ? (
						<p className="text-sm text-red-500 mb-3" role="alert">
							{formError}
						</p>
					) : null}

					<div className="form-group">
						<label htmlFor="admin-session-coach">
							Coach <span className="required">*</span>
						</label>
						<select
							id="admin-session-coach"
							value={coachId}
							onChange={(e) => setCoachId(e.target.value)}
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
							required
						>
							<option value="">Select coach</option>
							{coaches.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label
							className="!inline-flex !items-center gap-3 cursor-pointer mb-0 select-none"
						>
							<input
								type="checkbox"
								id="admin-session-group-class"
								checked={isGroupClass}
								className="peer sr-only"
								onChange={(e) => {
									setIsGroupClass(e.target.checked);
								}}
							/>
							<span>Group class</span>
							<span
								className={cn(
									'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
									'border-[rgba(255,255,255,0.32)] bg-transparent text-transparent',
									'peer-checked:border-[var(--primary-yellow)] peer-checked:bg-[var(--primary-yellow)] peer-checked:text-[#161616]'
								)}
								aria-hidden
							>
								✓
							</span>
						</label>
						<small className="block text-xs text-[var(--text-secondary)] mt-1">
							Group classes can optionally invite members; personal sessions require at least one
							member with an active membership.
						</small>
					</div>

					<div className="form-group">
						<label>
							Members with active membership{' '}
							{isGroupClass ? '(optional invites)' : <span className="required">*</span>}
						</label>
						<input
							type="search"
							id="admin-session-member-search"
							placeholder="Search members..."
							value={memberSearch}
							onChange={(e) => setMemberSearch(e.target.value)}
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm mb-2"
						/>
						<div
							className={cn(
								'max-h-40 overflow-y-auto rounded-xl border border-[var(--card-border)] p-2 space-y-1',
								'bg-[rgba(0,0,0,0.15)]'
							)}
						>
							{filteredMembers.length === 0 ? (
								<p className="text-xs text-[var(--text-secondary)] px-1 py-2">
									No members with an active subscription match.
								</p>
							) : (
								filteredMembers.map((u) => {
									const label = [u.firstName, u.middleName, u.lastName]
										.filter(Boolean)
										.join(' ');
									const checked = selectedMemberIds.includes(u.id);
									return (
										<label
											key={u.id}
											className={cn(
												'!flex !items-center gap-2.5 rounded-lg px-2 py-2 text-sm cursor-pointer w-full mb-0',
												checked ? 'bg-[rgba(249,197,19,0.12)]' : 'hover:bg-[rgba(255,255,255,0.04)]'
											)}
										>
											<input
												type="checkbox"
												checked={checked}
												className="peer sr-only"
												onChange={() => toggleMember(u.id)}
											/>
											<span
												className={cn(
													'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
													'border-[rgba(255,255,255,0.32)] bg-transparent text-transparent',
													'peer-checked:border-[var(--primary-yellow)] peer-checked:bg-[var(--primary-yellow)] peer-checked:text-[#161616]'
												)}
												aria-hidden
											>
												✓
											</span>
											<div className="min-w-0 leading-tight">
												<div className="text-[var(--text-primary)] font-medium truncate">{label}</div>
												<div className="text-[var(--text-secondary)] text-xs break-all">{u.email}</div>
											</div>
										</label>
									);
								})
							)}
						</div>
						<small className="block text-xs text-[var(--text-secondary)] mt-1">
							{selectedMemberIds.length} selected
						</small>
					</div>

					{isGroupClass ? (
						<div className="form-group">
							<label htmlFor="admin-session-max-p">
								Max participants <span className="required">*</span>
							</label>
							<input
								id="admin-session-max-p"
								type="number"
								min={1}
								value={maxParticipants}
								onChange={(e) => setMaxParticipants(e.target.value)}
								className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm"
							/>
						</div>
					) : null}

					<div className="form-group">
						<label htmlFor="admin-session-name">
							Workout name <span className="required">*</span>
						</label>
						<input
							id="admin-session-name"
							value={sessionName}
							onChange={(e) => setSessionName(e.target.value)}
							placeholder="e.g. Upper body"
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm"
							required
						/>
					</div>

					<div className="form-group">
						<label>
							Date <span className="required">*</span>
						</label>
						<DatePicker
							date={date}
							onDateChange={setDate}
							placeholder="Pick a date"
							className="w-full"
						/>
					</div>

					<div className="form-grid">
						<CustomTimePicker
							id="admin-session-start"
							label="Start time"
							required
							value={startTimeStr}
							onChange={setStartTimeStr}
						/>
						<CustomTimePicker
							id="admin-session-end"
							label="End time"
							value={endTimeStr}
							onChange={setEndTimeStr}
							min={startTimeStr || undefined}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="admin-session-area">
							Gym area <span className="required">*</span>
						</label>
						<select
							id="admin-session-area"
							value={gymArea}
							onChange={(e) => setGymArea(e.target.value)}
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm"
							required
						>
							<option value="">Select gym area</option>
							{GYM_AREAS.map((a) => (
								<option key={a.value} value={a.value}>
									{a.label}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label>
							Session schedule frequency <span className="required">*</span>
						</label>
						<div className="rounded-2xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.02)] p-3">
							<div className="flex flex-wrap gap-2 mb-3">
								{SCHEDULE_PRESETS.map((preset) => (
									(() => {
										const isActive = areSameWeekdaySet(scheduleDays, preset.days);
										return (
									<button
										key={preset.label}
										type="button"
										onClick={() => applySchedulePreset(preset.days)}
										className={cn(
											'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
											isActive
												? 'border-[rgba(96,165,250,0.75)] bg-[rgba(96,165,250,0.18)] text-[#bfdbfe]'
												: 'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(96,165,250,0.4)]'
										)}
									>
										{preset.label}
									</button>
										);
									})()
								))}
							</div>
							<div className="flex flex-wrap gap-2.5">
								{WEEKDAY_OPTIONS.map((day) => {
									const checked = scheduleDays.includes(day.value);
									return (
										<button
											key={day.value}
											type="button"
											onClick={() => toggleScheduleDay(day.value)}
											className={cn(
												'inline-flex min-w-[132px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
												'border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)]',
												checked && 'border-[var(--primary-yellow)] bg-[rgba(249,197,19,0.14)]'
											)}
										>
											<span
												className={cn(
													'flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px] font-bold',
													checked
														? 'border-[var(--primary-yellow)] bg-[var(--primary-yellow)] text-[#161616]'
														: 'border-[rgba(255,255,255,0.35)] bg-transparent text-transparent'
												)}
											>
												✓
											</span>
											<span>{day.label}</span>
										</button>
									);
								})}
							</div>
							<div className="mt-1 text-xs text-[var(--text-secondary)]">
								{scheduleDays.length > 0
									? `Selected: ${scheduleDays
											.map((d) => WEEKDAY_OPTIONS.find((x) => x.value === d)?.label ?? d)
											.join(', ')}`
									: 'No days selected yet.'}
							</div>
						</div>
					</div>

					<div className="form-group">
						<label htmlFor="admin-session-equipment-picker">Add equipment manually</label>
						<select
							id="admin-session-equipment-picker"
							value={equipmentPickerValue}
							onChange={(e) => {
								setEquipmentPickerValue(e.target.value);
								addEquipment(e.target.value);
							}}
							title="Add equipment manually"
							aria-label="Add equipment manually"
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
						>
							<option value="">
								{manualEquipmentSelections.length > 0
									? `${manualEquipmentSelections.length} equipment selected`
									: 'Choose equipment'}
							</option>
							{availableEquipmentOptions.map((eq) => (
								<option key={eq.id} value={eq.id} disabled={!eq.selectable}>
									{`${eq.name} (${eq.rightText})`}
								</option>
							))}
						</select>
						{manualEquipmentSelections.length > 0 ? (
							<div className="mt-2 space-y-2">
								{manualEquipmentSelections.map((row) => {
									const eq = equipmentById.get(row.equipmentId);
									if (!eq) return null;
									return (
										<div
											key={row.equipmentId}
											className="rounded-xl border border-[var(--card-border)] bg-[rgba(255,255,255,0.03)] p-3"
										>
											<div className="flex items-center justify-between gap-2">
												<div className="text-sm font-medium text-[var(--text-primary)]">
													{eq.name}
												</div>
												<button
													type="button"
													onClick={() => removeEquipment(row.equipmentId)}
													className="h-7 w-7 rounded-full border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[#F87171] inline-flex items-center justify-center"
													aria-label={`Remove ${eq.name}`}
													title="Remove"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
											<div className="mt-2 flex items-center justify-between gap-3">
												<span className="text-xs text-[var(--text-secondary)]">Qty</span>
												<input
													type="number"
													min={1}
													value={row.quantity}
													onChange={(e) =>
														updateEquipmentQty(row.equipmentId, e.target.value)
													}
													title={`Quantity for ${eq.name}`}
													aria-label={`Quantity for ${eq.name}`}
													className="w-24 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-1.5 text-sm text-[var(--text-primary)]"
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : null}
					</div>

					<div className="form-group">
						<label htmlFor="admin-session-note">Note</label>
						<textarea
							id="admin-session-note"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							rows={3}
							className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-sm"
							placeholder="Optional"
						/>
					</div>
				</div>
				<div className="modal-footer admin-session-modal-footer">
					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? 'Creating…' : 'Create session'}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
