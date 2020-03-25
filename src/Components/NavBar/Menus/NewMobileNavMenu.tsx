import { Box, ChevronIcon, color, Flex, Sans, Separator } from "@artsy/palette"
import { AnalyticsSchema, useSystemContext } from "Artsy"
import { useTracking } from "Artsy/Analytics"
import React from "react"
import styled from "styled-components"
import { MenuData, MenuLinkData } from "../menuData"
import { MobileLink } from "./MobileLink"
import {
  NavigatorContextProvider,
  useNavigation,
} from "./NavigatorContextProvider"

interface Props {
  isOpen: boolean
  menuData: MenuData
}

export const NewMobileNavMenu: React.FC<Props> = props => {
  const {
    links: [artworks, artists],
  } = props.menuData
  const { user } = useSystemContext()

  return (
    <NavigatorContextProvider>
      <MenuViewport>
        <AnimatingMenuWrapper isOpen={props.isOpen}>
          <ul>
            <MobileSubmenuLink menu={(artworks as MenuLinkData).menu}>
              {(artworks as MenuLinkData).menu.title}
            </MobileSubmenuLink>

            <MobileSubmenuLink menu={(artists as MenuLinkData).menu}>
              {(artists as MenuLinkData).menu.title}
            </MobileSubmenuLink>
            <MobileLink href="/auctions">Auctions</MobileLink>
            <MobileLink href="/articles">Editorial</MobileLink>
            <MobileLink href="/galleries">Galleries</MobileLink>
            <MobileLink href="/fairs">Fairs</MobileLink>
            <MobileLink href="/shows">Shows</MobileLink>
            <MobileLink href="/institutions">Museums</MobileLink>
            <MobileLink href="/gallery-partnerships">
              Partner with Artsy
            </MobileLink>
            {user ? <LoggedInLinks /> : <AuthenticateLinks />}
          </ul>
        </AnimatingMenuWrapper>
      </MenuViewport>
    </NavigatorContextProvider>
  )
}

const MenuViewport = styled.nav`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
`

export const AnimatingMenuWrapper = styled.div<{
  isOpen: boolean
}>`
  background: white;

  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  z-index: ${p => (p.isOpen ? 9999 : 0)};

  top: 0;
  left: 0; /* might be simpler to just animate this instead of the transform3d business */
  padding: 1em 20px;

  transform: translate3d(${p => (p.isOpen ? "0" : "100%")}, 0, 0);
  transition: transform 0.15s;
  ul {
    margin-bottom: 60px;
  }
`

const Menu = ({ isOpen, title, links, showBacknav = true }) => {
  return (
    <AnimatingMenuWrapper isOpen={isOpen}>
      <Flex position="relative">
        {showBacknav && <BackLink />}
        <Sans size={["5", "6"]} color={color("black100")} mx="auto">
          {title}
        </Sans>
      </Flex>
      <ul>{links.map(link => NavLink({ link }))}</ul>
    </AnimatingMenuWrapper>
  )
}

export const BackLink = () => {
  const { trackEvent } = useTracking()
  const { pop } = useNavigation()
  const contextModule = getContextModule()

  return (
    <Box
      position="absolute"
      onClick={e => {
        e.preventDefault()
        trackEvent({
          action_type: AnalyticsSchema.ActionType.Click,
          context_module: contextModule,
          flow: "Header",
          subject: "Back link",
        })
        pop()
      }}
      width="30px"
      height="30px"
    >
      <ChevronIcon
        direction="left"
        color={color("black100")}
        height="14px"
        width="14px"
        top="5px"
        left="-2px"
      />
    </Box>
  )
}

const getContextModule = () => {
  const { path } = useNavigation()
  let contextModule
  if (path[0] === "Artworks") {
    contextModule = AnalyticsSchema.ContextModule.HeaderArtworksDropdown
  } else if (path[0] === "Artists") {
    contextModule = AnalyticsSchema.ContextModule.HeaderArtistsDropdown
  } else {
    contextModule = AnalyticsSchema.ContextModule.Header
  }
  return contextModule
}

const NavLink = ({ link }) => {
  const isSubMenu = !!link.menu
  const contextModule = getContextModule()

  if (isSubMenu) {
    return (
      <React.Fragment key={link.menu.title}>
        <MobileSubmenuLink menu={link.menu}>{link.text}</MobileSubmenuLink>
        {link.dividerBelow && <Separator my={1} color={color("black10")} />}
      </React.Fragment>
    )
  } else {
    return (
      <React.Fragment key={link.href}>
        <MobileLink href={link.href} contextModule={contextModule}>
          {link.text}
        </MobileLink>
        {link.dividerBelow && <Separator my={1} color={color("black10")} />}
      </React.Fragment>
    )
  }
}

export const MobileSubmenuLink = ({ children, menu }) => {
  const { trackEvent } = useTracking()
  const { path, push } = useNavigation()
  const contextModule = getContextModule()

  return (
    <li>
      <Flex
        py={0.5}
        flexDirection="row"
        onClick={() => {
          push(menu.title)
          trackEvent({
            action_type: AnalyticsSchema.ActionType.Click,
            context_module: contextModule,
            flow: "Header",
            subject: menu.title,
          })
        }}
      >
        <Sans size={["5t", "6"]} color={color("black60")}>
          {children}
        </Sans>
        <ChevronIcon
          direction="right"
          color={color("black60")}
          height="14px"
          width="14px"
          top="6px"
          left="5px"
        />
      </Flex>
      <Menu
        isOpen={path.includes(menu.title)}
        title={menu.title}
        links={menu.links}
      />
    </li>
  )
}

const AuthenticateLinks = () => {
  return (
    <Box>
      <Separator my={1} color={color("black10")} />
      <MobileLink
        href={"/sign_up?intent=signup&trigger=click&contextModule=Header"}
      >
        Sign Up
      </MobileLink>
      <MobileLink
        href={"/log_in?intent=signup&trigger=click&contextModule=Header"}
      >
        Login
      </MobileLink>
    </Box>
  )
}

const LoggedInLinks = () => {
  return (
    <Box>
      <Separator my={1} color={color("black10")} />
      <MobileLink href="/works-for-you">Works for you</MobileLink>
      <MobileLink href="/user/edit">Account</MobileLink>
    </Box>
  )
}
