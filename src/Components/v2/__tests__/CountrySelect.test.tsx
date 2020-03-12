import { mount } from "enzyme"
import React from "react"
import { CountrySelect } from "../CountrySelect"

describe("CountrySelect", () => {
  // TODO: Chris, this test needs finishing.
  xit("triggers callback on change", done => {
    const wrapper = mount(
      <CountrySelect
        onSelect={() => {
          done()
        }}
      />
    )

    wrapper.find("select").simulate("change")
  })

  describe("when limited to list of continental european countries", () => {
    it("selects first country in list", () => {
      const wrapper = mount(<CountrySelect euShippingOnly />)
      expect(wrapper.find("select").props().value).toBe("AD")
    })
  })
})
