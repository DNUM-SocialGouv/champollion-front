import Select, { ClearIndicatorProps, MultiValueProps, ThemeConfig } from "react-select"
import { CSSProperties } from "react"

export type Option = {
  value: number
  label: string
}

type AppMultiSelectProps = {
  options: Option[]
  label: string
  hintText?: string
  onChange: (option: readonly Option[]) => void
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
    onClick: () => {}
    onTouchEnd: () => {}
    onMouseDown: () => {}
  }
  return (
    <>
      <button
        className="fr-btn--icon-right fr-icon-close-line fr-tag fr-tag--sm fr-m-1v"
        aria-label={`Retirer ${selectedData.label}`}
        onClick={() => removeProps?.onClick && removeProps.onClick()}
        onTouchEnd={() => removeProps?.onTouchEnd && removeProps.onTouchEnd()}
        onMouseDown={() => removeProps?.onMouseDown && removeProps.onMouseDown()}
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
  hintText,
  label,
  onChange,
  options,
}: AppMultiSelectProps) {
  return (
    <div className="fr-mb-3w">
      <label className="fr-label" htmlFor="select-postes">
        {label}
        {hintText && <span className="fr-hint-text">{hintText}</span>}
      </label>
      <Select
        id="select-postes"
        classNames={{
          control: (state) =>
            `bg-bg-contrast-grey rounded-t rounded-b-none border-none shadow-input fr-mt-1w ${
              state.isFocused
                ? "!outline !outline-2 outline-offset-2 !outline-outline" // react-select sets outline to "0!important" so important is necessary
                : ""
            }`,
          input: () => "fr-m-1v fr-py-0",
          placeholder: () => "fr-ml-1v",
          valueContainer: () => "fr-py-1v fr-px-3v",
        }}
        components={{ ClearIndicator, DropdownIndicator, MultiValue }}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isMulti
        noOptionsMessage={({ inputValue }) =>
          !!inputValue
            ? `Aucun résultat pour "${inputValue}"`
            : "Aucune option disponible"
        }
        options={options}
        onChange={onChange}
        placeholder=""
        theme={selectTheme}
      />
    </div>
  )
}
