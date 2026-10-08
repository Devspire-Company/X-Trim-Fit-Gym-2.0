import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
	date?: Date
	onDateChange?: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	maxDate?: Date
	minDate?: Date
	className?: string
}

export function DatePicker({
	date,
	onDateChange,
	placeholder = "Pick a date",
	disabled = false,
	maxDate,
	minDate,
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false)

	const handleDateSelect = React.useCallback((selectedDate: Date | undefined) => {
		onDateChange?.(selectedDate)
		setOpen(false)
	}, [onDateChange])

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"w-full justify-start text-left font-normal cursor-pointer",
						"flex items-center gap-2",
						className
					)}
					disabled={disabled}
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						if (!disabled) {
							setOpen(true)
						}
					}}
					style={{
						padding: '0.9rem 1rem',
						background: 'rgba(255, 255, 255, 0.05)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: '12px',
						color: date ? 'var(--text-primary)' : 'var(--text-secondary)',
						fontSize: '0.9rem',
						fontFamily: 'Inter, sans-serif',
						transition: 'all 0.3s ease',
						cursor: disabled ? 'not-allowed' : 'pointer',
						width: '100%',
					}}
					onMouseEnter={(e) => {
						if (!disabled) {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
							e.currentTarget.style.borderColor = 'var(--primary-yellow)';
						}
					}}
					onMouseLeave={(e) => {
						if (!disabled) {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
							e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
						}
					}}
					onFocus={(e) => {
						if (!disabled) {
							e.currentTarget.style.borderColor = 'var(--primary-yellow)';
							e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 197, 19, 0.1)';
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
						}
					}}
					onBlur={(e) => {
						if (!disabled) {
							e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
							e.currentTarget.style.boxShadow = 'none';
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
						}
					}}
				>
					<CalendarIcon className="h-4 w-4" style={{ flexShrink: 0 }} />
					<span style={{ flex: 1, textAlign: 'left' }}>
						{date ? format(date, "PPP") : placeholder}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent 
				className="w-auto p-0" 
				align="start"
				onOpenAutoFocus={(e) => e.preventDefault()}
				style={{ zIndex: 9999 }}
			>
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					captionLayout="dropdown"
					fromYear={minDate ? minDate.getFullYear() : 1900}
					toYear={maxDate ? maxDate.getFullYear() : new Date().getFullYear()}
					disabled={(date) => {
						if (maxDate) {
							const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
							const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
							if (dateOnly > maxDateOnly) return true;
						}
						if (minDate) {
							const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
							const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
							if (dateOnly < minDateOnly) return true;
						}
						return false
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}

