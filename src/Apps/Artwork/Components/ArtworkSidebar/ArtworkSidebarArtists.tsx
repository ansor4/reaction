import { Box, Serif } from "@artsy/palette"
import { SystemContextConsumer } from "Artsy"
import * as Schema from "Artsy/Analytics/Schema"

import { FollowIcon } from "Components/FollowIcon"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"

import { ArtworkSidebarArtists_artwork } from "__generated__/ArtworkSidebarArtists_artwork.graphql"
import * as SchemaV2 from "Artsy/Analytics/v2/Schema"
import { FollowArtistButtonFragmentContainer as FollowArtistButton } from "Components/FollowButton/FollowArtistButton"
import { openAuthToFollowSave } from "Utils/openAuthModal"

export interface ArtistsProps {
  artwork: ArtworkSidebarArtists_artwork
}

type Artist = ArtworkSidebarArtists_artwork["artists"][0]

export class ArtworkSidebarArtists extends React.Component<ArtistsProps> {
  private renderArtistName(artist: Artist) {
    return artist.href ? (
      <Serif size="5t" display="inline" weight="semibold" element="h1">
        <a href={artist.href}>{artist.name}</a>
      </Serif>
    ) : (
      <Serif size="5t" display="inline" weight="semibold" element="h1">
        {artist.name}
      </Serif>
    )
  }

  handleOpenAuth = (mediator, artist) => {
    openAuthToFollowSave(mediator, {
      entity: artist,
      contextModule: SchemaV2.ContextModule.artworkSidebar,
      intent: SchemaV2.AuthIntent.followArtist,
    })
  }

  private renderSingleArtist = (artist: Artist, user, mediator) => {
    return (
      <React.Fragment>
        {this.renderArtistName(artist)}
        <FollowArtistButton
          artist={artist}
          user={user}
          trackingData={{
            modelName: Schema.OwnerType.Artist,
            context_module: Schema.ContextModule.Sidebar,
            context_page: "Artwork page",
            entity_id: artist.internalID,
            entity_slug: artist.slug,
          }}
          onOpenAuthModal={() => this.handleOpenAuth(mediator, artist)}
          triggerSuggestions
          render={({ is_followed }) => {
            return <FollowIcon isFollowed={is_followed} />
          }}
        >
          Follow
        </FollowArtistButton>
      </React.Fragment>
    )
  }

  renderMultipleArtists() {
    const {
      artwork: { artists },
    } = this.props
    return artists.map((artist, index) => {
      return (
        <React.Fragment key={artist.id}>
          {this.renderArtistName(artist)}
          {index !== artists.length - 1 && ", "}
        </React.Fragment>
      )
    })
  }

  renderCulturalMaker(cultural_maker: string) {
    return (
      <Serif size="5t" display="inline-block" weight="semibold">
        {cultural_maker}
      </Serif>
    )
  }
  render() {
    const {
      artwork: { artists, cultural_maker },
    } = this.props
    return (
      <SystemContextConsumer>
        {({ user, mediator }) => {
          return (
            <Box>
              {artists.length === 1
                ? this.renderSingleArtist(artists[0], user, mediator)
                : this.renderMultipleArtists()}
              {artists.length === 0 &&
                cultural_maker &&
                this.renderCulturalMaker(cultural_maker)}
            </Box>
          )
        }}
      </SystemContextConsumer>
    )
  }
}

export const ArtworkSidebarArtistsFragmentContainer = createFragmentContainer(
  ArtworkSidebarArtists,
  {
    artwork: graphql`
      fragment ArtworkSidebarArtists_artwork on Artwork
        @argumentDefinitions(
          showFollowSuggestions: { type: "Boolean", defaultValue: true }
        ) {
        cultural_maker: culturalMaker
        artists {
          id
          internalID
          slug
          name
          href
          ...FollowArtistButton_artist
            @arguments(showFollowSuggestions: $showFollowSuggestions)
        }
      }
    `,
  }
)
