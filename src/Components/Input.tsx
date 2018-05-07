import React from "react"
import styled from "styled-components"
import Colors from "Assets/Colors"
import { fadeIn, fadeOut, growAndFadeIn } from "Assets/Animations"
import { garamond, unica } from "Assets/Fonts"
import { block } from "./Helpers"
import { borderedInput } from "./Mixins"
import { OpenEye } from "Assets/Icons/OpenEye"
import { ClosedEye } from "Assets/Icons/ClosedEye"

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  error?: string
  block?: boolean
  label?: string
  title?: string
  description?: string
  quick?: boolean
  leftView?: JSX.Element
  rightView?: JSX.Element
  setTouched?: (fields: { [field: string]: boolean }) => void
}

interface InputState {
  focused: boolean
  value: string
  showPassword: boolean
}

/**
 * Configurable input field. It comes in two modes, standard & quick.
 * In standard mode, the `title` and `description` props are rendered above
 * the input. In quick mode, `title` and `description` are ignored, only
 * `label` is rendered inside the input.
 *
 * @example
 *
 * ```javascript
 *  // Quick mode
 *  <Input
 *    quick
 *    label="Name"
 *    type="text"
 *    placeholder="Enter you name"
 *  />
 *  ```
 *
 * ```
 *  // Standard mode
 *  <Input
 *    title="Name"
 *    description="Your full name."
 *    type="text"
 *  />
 */
class Input extends React.Component<InputProps, InputState> {
  static defaultProps = {
    value: "",
  }

  state = {
    focused: false,
    value: (this.props.value as string) || "",
    showPassword: false,
  }

  componentWillReceiveProps(newProps) {
    if (this.props.name !== newProps.name) {
      this.setState({
        value: "",
      })
    }
  }

  onFocus = e => {
    this.setState({
      focused: true,
    })

    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  }

  onBlur = e => {
    this.setState({
      focused: false,
    })

    if (this.props.onBlur) {
      this.props.onBlur(e)
    }
  }

  onChange = e => {
    if (this.props.setTouched) {
      this.props.setTouched({ [this.props.name]: true })
    }
    this.setState({
      value: e.currentTarget.value,
    })

    if (this.props.onChange) {
      this.props.onChange(e)
    }
  }

  getRightViewForPassword() {
    let icon = this.state.showPassword ? (
      <ClosedEye onClick={this.toggleShowPassword} />
    ) : (
      <OpenEye onClick={this.toggleShowPassword} />
    )

    return <span onClick={this.toggleShowPassword}>{icon}</span>
  }

  toggleShowPassword = e => {
    this.setState({
      showPassword: !this.state.showPassword,
    })
  }

  get convertedType() {
    const { type } = this.props
    if (this.state.showPassword && type === "password") {
      return "text"
    }
    return type
  }

  render() {
    const { error, quick } = this.props

    if (quick) {
      // prettier-ignore
      const {
        label,
        leftView,
        rightView,
        className,
        ref,
        type,
        onChange,
        setTouched,
        ...newProps
      } = this.props
      const showLabel = (!!this.state.focused || !!this.state.value) && !!label
      const isPassword = type === "password"

      return (
        <Container>
          <InputContainer
            hasLabel={!!label}
            focused={this.state.focused}
            hasError={!!error}
          >
            <Label out={!showLabel}>{label}</Label>
            {!!leftView && leftView}
            <InputComponent
              {...newProps}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              onChange={this.onChange}
              value={this.state.value}
              type={this.convertedType}
            />
            {isPassword
              ? this.getRightViewForPassword()
              : !!rightView && rightView}
          </InputContainer>
          <Error show={!!error}>{error}</Error>
        </Container>
      )
    }

    const { title, description } = this.props
    return (
      <Container>
        {title && <Title>{title}</Title>}
        {description && <Description>{description}</Description>}
        <StyledInput {...this.props as any} />
        <Error show={!!error}>{error}</Error>
      </Container>
    )
  }
}

const Container = styled.div`
  padding: 5px 0;
`

const StyledInput = styled.input`
  ${borderedInput};
  ${block(24)};
`

const InputComponent = styled.input`
  ${garamond("s17")};
  border: 0;
  font-size: 17px;
  outline: none;
  flex: 1;
  transition: transform 0.25s;

  &:active,
  &:focus,
  &:not(:placeholder-shown) {
    transform: translateY(2px);
  }

  &::placeholder {
    color: ${Colors.grayMedium};
  }
`

const InputContainer = styled.div.attrs<{
  hasLabel?: boolean
  focused?: boolean
  hasError: boolean
}>({})`
  ${borderedInput};
  margin-right: 0;
  margin-top: 5px;
  margin-bottom: 5px;
  display: flex;
  position: relative;
  height: ${p => (p.hasLabel ? "40px" : "20px")};
  flex-direction: row;
  align-items: center;
`

const Label = styled.label.attrs<{ out: boolean }>({})`
  ${unica("s12", "medium")};
  position: absolute;
  left: 10px;
  top: 7px;
  visibility: ${p => (p.out ? "hidden" : "visible")};
  animation: ${p => (p.out ? fadeOut : fadeIn)} 0.2s linear;
  transition: visibility 0.2s linear;
`

const Title = styled.div`
  ${garamond("s17")};
`

const Description = styled.div`
  ${garamond("s15")};
  color: ${Colors.graySemibold};
  margin: 3px 0 0;
`

const Error = styled.div.attrs<{ show: boolean }>({})`
  ${unica("s12")};
  margin-top: 10px;
  color: ${Colors.redMedium};
  visibility: ${p => (p.show ? "visible" : "hidden")};
  animation: ${p => p.show && growAndFadeIn("16px")} 0.25s linear;
  height: ${p => (p.show ? "16px" : "0")};
  transition: visibility 0.2s linear;
`

export default Input
