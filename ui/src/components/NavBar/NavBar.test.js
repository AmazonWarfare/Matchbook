/*
    Use this file as a template/guide for testing. Our testing stack includes:
        - Jest (https://jestjs.io/docs/en/tutorial-react)
        - Enzyme (https://airbnb.io/enzyme/docs/api/)
        - Chai (https://www.chaijs.com/api/)
        - Sinon (https://sinonjs.org/releases/v8.1.1/spies/)
        - chance (https://chancejs.com/)

    Jest is preconfigured by create-react-app so we don't have to import that here. Run all tests by
    running "npm run test" in either the /ui/ directory (just UI tests) or the main project directory
    (eventually UI and server-side tests, but we have no server-side tests yet).
 */
import React from 'react'; // need to import react to use JSX and react components
import Adapter from 'enzyme-adapter-react-16'; // adapter needed for enzyme
import {shallow, configure} from 'enzyme'; // enzyme library: for mocking React components
import Chance from 'chance'; // chance library: for generating dummy text, integers, etc.
import { expect } from 'chai' // chai library: assertion library
import sinon from 'sinon'; // sinon library: for "stubbing" or "mocking" functions

import NavBar from "./NavBar"; // import unit under test

// these next two steps are just boilerplate code that needs to happen to correctly use chance and enzyme
let chance = new Chance(); // initialize chance
configure({adapter: new Adapter()}); //configure adapter

describe('NavBar Tests', () => { // describe (part of Jest) takes a string describing the test suite and a function () => {...}
                                // see: javascript "arrow notation"
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <NavBar

            />); // create a shallow wrapper of our component with the dummy text/function
    });

    it('should have div as first and only child', () => {
        expect(wrapper.children()).to.have.lengthOf(1); // wrapper methods like children() and find() are used to inspect
        expect(wrapper.find('div')).to.have.lengthOf(1); // the correctness of the component mocked above
    });
    it('should have div with only one child which is a Navbar', () => {
        expect(wrapper.childAt(0).children()).to.have.lengthOf(1); // wrapper methods like children() and find() are used to inspect
        expect(wrapper.childAt(0).find('Navbar')).to.have.lengthOf(1); // the correctness of the component mocked above
    });
    it('should have Navbar with only one child which is a NavbarBrand', () => {
        expect(wrapper.childAt(0).childAt(0).children()).to.have.lengthOf(1); // wrapper methods like children() and find() are used to inspect
        expect(wrapper.childAt(0).childAt(0).find('NavbarBrand')).to.have.lengthOf(1); // the correctness of the component mocked above
    });
    it('should have NavbarBrand with only one child which is a NavBarLogo', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(0).find('NavBarLogo')).to.have.lengthOf(1); // the correctness of the component mocked above
    });

});