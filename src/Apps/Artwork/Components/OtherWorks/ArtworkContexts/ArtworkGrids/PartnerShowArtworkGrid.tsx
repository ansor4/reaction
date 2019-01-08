import { PartnerShowArtworkGrid_artwork } from "__generated__/PartnerShowArtworkGrid_artwork.graphql"
import { hideGrid } from "Apps/Artwork/Components/OtherWorks/ArtworkContexts/ArtworkGrids"
import { Mediator, withContext } from "Artsy/SystemContext"
import ArtworkGrid from "Components/ArtworkGrid"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { data as sd } from "sharify"
import { Header } from "../../Header"

interface PartnerShowArtworkGridProps {
  artwork: PartnerShowArtworkGrid_artwork
  mediator?: Mediator
}

class PartnerShowArtworkGrid extends React.Component<
  PartnerShowArtworkGridProps
> {
  render() {
    const {
      artwork: {
        show: { artworksConnection, href, name },
      },
      mediator,
    } = this.props

    if (hideGrid(artworksConnection)) {
      return null
    }

    return (
      <>
        <Header
          title={`Other works from ${name}`}
          buttonHref={sd.APP_URL + href}
        />
        <ArtworkGrid
          artworks={artworksConnection}
          columnCount={[2, 3, 4]}
          mediator={mediator}
          onBrickClick={() => {
            console.log("clicking partner show artwork grid")
          }}
        />
      </>
    )
  }
}

export const PartnerShowArtworkGridFragmentContainer = createFragmentContainer(
  withContext(PartnerShowArtworkGrid),
  graphql`
    fragment PartnerShowArtworkGrid_artwork on Artwork
      @argumentDefinitions(excludeArtworkIDs: { type: "[String!]" }) {
      show {
        href
        name

        artworksConnection(first: 8, exclude: $excludeArtworkIDs) {
          ...ArtworkGrid_artworks

          # Used to check for content
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `
)
