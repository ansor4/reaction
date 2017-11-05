import { get, once } from "lodash"
import React, { Component } from "react"
import styled, { StyledFunction } from "styled-components"
import Colors from "../../../Assets/Colors"
import { crop, resize } from "../../../Utils/resizer"
import { track } from "../../../Utils/track"
import { pMedia } from "../../Helpers"
import { Fonts } from "../Fonts"
import { VideoControls } from "../Sections/VideoControls"

interface Props extends React.HTMLProps<HTMLDivElement> {
  campaign: any
  isMobile?: boolean
  unit: any
}

interface State {
  isPlaying: boolean
  showCoverImage: boolean
}

@track()
export class DisplayPanel extends Component<Props, State> {
  public video: HTMLVideoElement

  state = {
    isPlaying: false,
    showCoverImage: false
  }

  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleVideoClick = this.handleVideoClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  @track(once(props => ({
    action: "Impression",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  })))
  componentDidMount() {
    if (this.video) {
      this.video.onended = () => {
        this.pauseVideo()
      }
    }
  }

  withinMediaArea(event) {
    const classes = [
      "DisplayPanel__Image",
      "VideoContainer",
      "VideoContainer__VideoCover",
      "VideoContainer__VideoControls",
      "VideoContainer__video",
      "PlayButton",
      "PlayButton__PlayButtonCaret"
    ]
    const withinMediaArea = classes.some(c => event.target.className.includes(c))
    return withinMediaArea
  }

  /**
   * Handle clicks to main container
   * @param event
   */
  @track(props => ({
    action: "Click",
    label: "Display ad clickthrough",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  }))
  handleClick(event) {
    event.preventDefault()
    const { isMobile, unit } = this.props
    const url = get(unit, "link.url", false)
    const isVideo = this.checkIfVideo()
    const openUrl = () => window.open(url, "_blank")

    if (isMobile) {
      if (isVideo) {
        if (this.withinMediaArea(event)) {
          this.toggleVideo()
        } else {
          openUrl()
        }
        // Image
      } else {
        if (this.withinMediaArea(event)) {
          this.toggleCoverImage()
        } else {
          openUrl()
        }
      }
      // Desktop
    } else {
      if (isVideo) {
        this.pauseVideo()
      }
      openUrl()
    }
  }

  /**
   * Handle clicks to Video player
   * @param event
   */
  @track(props => ({
    action: "Click",
    label: "Display ad play video",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  }))
  handleVideoClick(event) {
    // noop
  }

  /**
   * Handle MouseEnter
   */
  @track(props => ({
    action: "MouseEnter",
    label: "Display ad play video",
    entity_type: "display_ad",
    campaign_name: props.campaign.name,
    unit_layout: "panel"
  }))
  handleMouseEnter() {
    if (this.props.isMobile) {
      return false
    } else {
      if (this.checkIfVideo()) {
        this.playVideo()
      } else {
        this.toggleCoverImage()
      }
    }
  }

  /**
   * Handle MouseLeave
   */
  handleMouseLeave() {
    if (this.props.isMobile) {
      return false
    } else {
      if (this.checkIfVideo()) {
        this.pauseVideo()
      } else {
        this.toggleCoverImage()
      }
    }
  }

  toggleCoverImage() {
    const showCoverImage = !this.state.showCoverImage

    this.setState({
      showCoverImage
    })
  }

  toggleVideo() {
    if (this.state.isPlaying) {
      this.pauseVideo()
    } else {
      this.playVideo()
    }
  }

  playVideo = () => {
    if (this.video) {
      this.video.play()

      this.setState({
        isPlaying: true
      })
    }
  }

  pauseVideo = () => {
    if (this.video) {
      this.video.pause()

      this.setState({
        isPlaying: false
      })
    }
  }

  checkIfVideo() {
    const assetUrl = get(this.props.unit, "assets.0.url", "")
    const isVideo = assetUrl.includes("mp4")
    return isVideo
  }

  renderVideo = (url) => {
    const { isPlaying } = this.state
    const { isMobile } = this.props

    return (
      <VideoContainer onClick={this.handleVideoClick} className="VideoContainer">
        {!isPlaying &&
          <VideoCover className="VideoContainer__VideoCover">
            {isMobile &&
              <VideoControls mini
                className="VideoContainer__VideoControls"
              />
            }
          </VideoCover>
        }

        <video playsInline
          src={url}
          className="VideoContainer__video"
          controls={false}
          ref={video => (this.video = video)}
        />
      </VideoContainer>
    )
  }

  render() {
    const { showCoverImage } = this.state
    const { unit, campaign, isMobile } = this.props
    const url = get(unit.assets, "0.url", "")
    const isVideo = this.checkIfVideo()
    const cover = unit.cover_image_url || ""
    const imageUrl = crop(url, { width: 680, height: 284 })
    const hoverImageUrl = resize(unit.logo, { width: 680 })
    const coverUrl = crop(cover, { width: 680, height: 284 })

    return (
      <Wrapper
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <DisplayPanelContainer
          className='DisplayPanel__DisplayPanelContainer'
          imageUrl={imageUrl}
          isMobile={isMobile}
          hoverImageUrl={hoverImageUrl}
          coverUrl={coverUrl}
          showCoverImage={showCoverImage}>

          {isVideo
            ? this.renderVideo(url)
            : <Image
                className='DisplayPanel__Image'
              /> }

          <div>
            <Headline>
              {unit.headline}
            </Headline>

            <Body dangerouslySetInnerHTML={{
              __html: unit.body
            }} />

            <SponsoredBy>
              {`Sponsored by ${campaign.name}`}
            </SponsoredBy>
          </div>
        </DisplayPanelContainer>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  cursor: pointer;
  text-decoration: none;
  color: black;
`

const Image = styled.div`
  margin-bottom: 15px;
  width: 100%;
  height: 142px;
  background-color: black;
  box-sizing: border-box;
`

const VideoCover = Image.extend`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface DivUrlProps extends React.HTMLProps<HTMLDivElement> {
  coverUrl?: string
  hoverImageUrl?: string
  isMobile?: boolean
  imageUrl?: string
  showCoverImage?: boolean
}

const Div: StyledFunction<DivUrlProps> = styled.div
const DisplayPanelContainer = Div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Colors.grayRegular};
  padding: 20px;
  max-width: 360px;
  box-sizing: border-box;
  ${Image} {
    background: url(${props => (props.imageUrl || "")}) no-repeat center center;
    background-size: cover;

    ${props => props.showCoverImage && props.hoverImageUrl
      ? `
          background: black url(${props.hoverImageUrl}) no-repeat center center;
          background-size: contain;
          border: 10px solid black;
        `
      : ""
    }
  }

  ${VideoCover} {
    background: url(${props => (props.coverUrl || "")}) no-repeat center center;
    background-size: cover;
  }

  .hover {
    ${VideoCover} {
      ${props => !props.isMobile && "display: none;"}
    }
  }

  ${pMedia.md`
    margin: auto;
  `}

  ${pMedia.sm`
    margin: auto;
  `}

  ${pMedia.xs`
    margin: auto;
  `}
`

const Headline = styled.div`
  ${Fonts.unica("s16", "medium")} line-height: 1.23em;
  margin-bottom: 3px;
`

const Body = styled.div`
  ${Fonts.garamond("s17")} line-height: 1.53em;
  margin-bottom: 20px;
  a {
    color: black;
  }
`

const SponsoredBy = styled.div`
  ${Fonts.avantgarde("s11")} color: ${Colors.grayRegular};
`

const VideoContainer = Image.extend`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  video {
    object-fit: cover;
    object-position: 50%;
    width: 100%;
    height: 100%;
  }
`

// Set names for tests and DOM
DisplayPanelContainer.displayName = "DisplayPanelContainer"
Image.displayName = "Image"
VideoContainer.displayName = "VideoContainer"
VideoCover.displayName = "VideoCover"
Wrapper.displayName = "Wrapper"

