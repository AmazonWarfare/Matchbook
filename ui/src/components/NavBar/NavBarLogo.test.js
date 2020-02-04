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

import NavBarLogo from "./NavBarLogo"; // import unit under test

// these next two steps are just boilerplate code that needs to happen to correctly use chance and enzyme
let chance = new Chance(); // initialize chance
configure({adapter: new Adapter()}); //configure adapter

describe('Button Tests', () => { // describe (part of Jest) takes a string describing the test suite and a function () => {...}
                                // see: javascript "arrow notation"
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <NavBarLogo
            />);
    });

    it('should have img as first and only child', () => {

        expect(wrapper.find('img')).to.have.lengthOf(1); // the correctness of the component mocked above
    });

});
