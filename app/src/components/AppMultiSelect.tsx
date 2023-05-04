import { useState, useEffect, CSSProperties, useId } from "react"
import Select, {
  ClearIndicatorProps,
  InputActionMeta,
  MultiValue as MultiValueOpt,
  MultiValueProps,
  SingleValue as SingleValueOpt,
  ThemeConfig,
  GroupBase,
} from "react-select"
import { SelectComponents } from "react-select/dist/declarations/src/components"

export type Option = {
  value: number
  label: string
  display?: string
}

type AppMultiSelectProps = {
  className?: string
  customComponents?: Partial<SelectComponents<Option, boolean, GroupBase<Option>>>
  hintText?: string
  isMulti?: boolean
  label: string
  onChange: (newValue: MultiValueOpt<Option> | SingleValueOpt<Option>) => void
  options: Option[]
  value: Option | Option[]
}

const selectTheme = () => {
  const dsfrTheme: ThemeConfig = {
    borderRadius: 0,
    colors: {
      primary: "var(--artwork-major-blue-france)", // intense blue, used on selected option in menu
      primary75: "var(--artwork-minor-blue-france)",
      primary50: "var(--background-action-low-blue-france-hover)",
      primary25: "var(--artwork-decorative-blue-france)", // lightest blue, used for menu item hover
      danger: "var(--background-flat-error)",
      dangerLight: "var(--background-contrast-error)",
      neutral0: "var(--background-default-grey)", // lightest grey
      neutral5: "var(--background-alt-grey)",
      neutral10: "var(--background-contrast-grey)",
      neutral20: "var(--border-default-grey)",
      neutral30: "var(--border-default-grey)",
      neutral40: "var(--text-disabled-grey)",
      neutral50: "var(--text-disabled-grey)",
      neutral60: "var(--text-mention-grey)",
      neutral70: "var(--text-mention-grey)",
      neutral80: "var(--text-default-grey)",
      neutral90: "var(--text-title-grey)", // darkest grey
    },
    spacing: {
      baseUnit: 4,
      controlHeight: 40,
      menuGutter: 8,
    },
  }
  return dsfrTheme
}

const MultiValue = (props: MultiValueProps<Option>) => {
  const selectedData = props.data as Option
  const removeProps = props.removeProps as {
    onClick: () => void
    onTouchEnd: () => void
  }
  return (
    <>
      <button
        className="fr-btn--icon-right fr-icon-close-line fr-tag fr-tag--sm fr-m-1v"
        aria-label={`Retirer ${selectedData.label}`}
        onClick={() => removeProps?.onClick && removeProps.onClick()}
        onTouchEnd={() => removeProps?.onTouchEnd && removeProps.onTouchEnd()}
        type="button"
      >
        {selectedData.label}
      </button>
    </>
  )
}

const DropdownIndicator = () => <div className="fr-icon-arrow-down-s-line fr-px-1w" />

const ClearIndicator = (props: ClearIndicatorProps<Option>) => {
  const { getStyles, innerProps } = props
  return (
    <div
      {...innerProps}
      className="hover:!text-tx-active-grey"
      style={getStyles("clearIndicator", props) as CSSProperties}
    >
      <div className="fr-icon-close-line cursor-pointer" />
    </div>
  )
}

export default function AppMultiSelect({
  className,
  customComponents,
  hintText,
  isMulti = true,
  label,
  onChange,
  options,
  value: valueProp,
}: AppMultiSelectProps) {
  const [value, setValue] = useState(valueProp)
  const selectId = "select-postes" + useId()

  useEffect(() => {
    setValue(valueProp)
  }, [valueProp])

  const onInputChange = (
    inputValue: string,
    { action, prevInputValue }: InputActionMeta
  ) => {
    if (isMulti && action !== "input-change") {
      return prevInputValue
    }
    return inputValue
  }

  return (
    <div className={`fr-mb-3w ${className}`}>
      <label className="fr-label" htmlFor={selectId}>
        {label}
        {hintText && <span className="fr-hint-text">{hintText}</span>}
      </label>
      <Select
        id={selectId}
        classNames={{
          control: (state) =>
            `bg-bg-contrast-grey rounded-t rounded-b-none border-none shadow-input fr-mt-1w ${
              state.isFocused
                ? "!outline !outline-2 outline-offset-2 !outline-outline" // react-select sets outline to "0!important" so important is necessary
                : ""
            }`,
          input: () => "fr-m-1v fr-py-0",
          menu: () => "z-10 shadow-overlap",
          placeholder: () => "fr-ml-1v",
          valueContainer: () => "fr-py-1v fr-px-3v",
        }}
        components={{
          ClearIndicator,
          DropdownIndicator,
          MultiValue,
          ...customComponents,
        }}
        closeMenuOnSelect={!isMulti}
        hideSelectedOptions={false}
        isClearable
        isMulti={isMulti}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `Aucun résultat pour "${inputValue}"` : "Aucune option disponible"
        }
        options={options}
        onChange={onChange}
        onInputChange={onInputChange}
        placeholder=""
        theme={selectTheme}
        value={value}
      />
    </div>
  )
}
