import { FairArtworkGrid_artwork } from "__generated__/FairArtworkGrid_artwork.graphql"
import { hideGrid } from "Apps/Artwork/Components/OtherWorks/ArtworkContexts/ArtworkGrids"
import { Mediator, withContext } from "Artsy/SystemContext"
import ArtworkGrid from "Components/ArtworkGrid"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { data as sd } from "sharify"
import { Header } from "../../Header"

interface FairArtworkGridProps {
  artwork: FairArtworkGrid_artwork
  mediator?: Mediator
}

class FairArtworkGrid extends React.Component<FairArtworkGridProps> {
  render() {
    const {
      artwork: {
        fair: { href, artworksConnection },
      },
      mediator,
    } = this.props

    if (hideGrid(artworksConnection)) {
      return null
    }

    return (
      <>
        <Header
          title={"Other works from the booth"}
          buttonHref={sd.APP_URL + href}
        />
        <ArtworkGrid
          artworks={artworksConnection}
          columnCount={[2, 3, 4]}
          mediator={mediator}
          onBrickClick={() => {
            console.log("clicking fair artwork grid")
          }}
        />
      </>
    )
  }
}

export const FairArtworkGridFragmentContainer = createFragmentContainer(
  withContext(FairArtworkGrid),
  graphql`
    fragment FairArtworkGrid_artwork on Artwork
      @argumentDefinitions(excludeArtworkIDs: { type: "[String!]" }) {
      fair: show(at_a_fair: true) {
        href

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
