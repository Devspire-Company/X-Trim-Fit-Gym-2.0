import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import {
	Children,
	Fragment,
	isValidElement,
	useState,
	type ChangeEvent,
	type ReactElement,
	type ReactNode,
	type SelectHTMLAttributes,
} from 'react';

const EMPTY_VALUE = '__xtrim_empty_select_value__';

type NativeOptionProps = {
	value?: string | number | readonly string[];
	disabled?: boolean;
	children?: ReactNode;
};

type UiSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple' | 'size'>;

function collectOptions(children: ReactNode): ReactElement<NativeOptionProps>[] {
	const options: ReactElement<NativeOptionProps>[] = [];

	Children.forEach(children, (child) => {
		if (Array.isArray(child)) {
			options.push(...collectOptions(child));
			return;
		}

		if (!isValidElement<NativeOptionProps>(child)) return;

		if (child.type === 'option') {
			options.push(child);
			return;
		}

		if (child.type === 'optgroup' || child.type === Fragment) {
			options.push(...collectOptions(child.props.children));
		}
	});

	return options;
}

function normalizeValue(value: unknown) {
	if (Array.isArray(value)) return String(value[0] ?? '');
	return value == null ? '' : String(value);
}

export function UiSelect({
	children,
	value,
	defaultValue,
	onChange,
	name,
	id,
	className,
	disabled,
	required,
	'aria-label': ariaLabel,
	title,
}: UiSelectProps) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(() => normalizeValue(defaultValue));
	const selectedValue = isControlled ? normalizeValue(value) : internalValue;
	const options = collectOptions(children);
	const selectedOption = options.find(
		(option) => normalizeValue(option.props.value) === selectedValue
	);
	const displayValue = selectedOption?.props.children ?? options[0]?.props.children ?? 'Select';

	function handleValueChange(radixValue: string) {
		const nextValue = radixValue === EMPTY_VALUE ? '' : radixValue;
		if (!isControlled) setInternalValue(nextValue);

		if (onChange) {
			const target = { name: name ?? '', value: nextValue } as EventTarget & HTMLSelectElement;
			onChange({ target, currentTarget: target } as ChangeEvent<HTMLSelectElement>);
		}
	}

	return (
		<SelectPrimitive.Root
			value={selectedValue === '' ? EMPTY_VALUE : selectedValue}
			onValueChange={handleValueChange}
			disabled={disabled}
			name={name}
			required={required}
		>
			<SelectPrimitive.Trigger
				id={id}
				className={`ui-select-trigger ${className ?? ''}`}
				aria-label={ariaLabel}
				title={title}
			>
				<span className="ui-select-value">{displayValue}</span>
				<SelectPrimitive.Icon asChild>
					<ChevronDown className="ui-select-chevron" aria-hidden="true" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					className="ui-select-content"
					position="popper"
					sideOffset={6}
					collisionPadding={10}
				>
					<SelectPrimitive.Viewport className="ui-select-viewport">
						{options.map((option, index) => {
							const optionValue = normalizeValue(option.props.value);
							return (
								<SelectPrimitive.Item
									key={`${optionValue}-${index}`}
									value={optionValue === '' ? EMPTY_VALUE : optionValue}
									disabled={option.props.disabled}
									className="ui-select-item"
								>
									<SelectPrimitive.ItemText>{option.props.children}</SelectPrimitive.ItemText>
									<SelectPrimitive.ItemIndicator className="ui-select-indicator">
										<Check aria-hidden="true" />
									</SelectPrimitive.ItemIndicator>
								</SelectPrimitive.Item>
							);
						})}
					</SelectPrimitive.Viewport>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
