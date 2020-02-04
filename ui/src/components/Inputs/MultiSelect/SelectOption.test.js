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

import SelectOption from "./SelectOption"; // import unit under test

// these next two steps are just boilerplate code that needs to happen to correctly use chance and enzyme
let chance = new Chance(); // initialize chance
configure({adapter: new Adapter()}); //configure adapter

describe('Select Option Tests', () => { // describe (part of Jest) takes a string describing the test suite and a function () => {...}
                                // see: javascript "arrow notation"
    let givenText,
        givenClass,
        givenOnClick,
        wrapper;

    beforeEach(() => {  // beforeEach (part of Jest): runs the function before each test (it-block), set up variables
                        // needed for each test here. Code that can just be run once can simply be declared in the describe
                        // block without using beforeEach. This should be used when fresh setup needs to be done for each
                        // test case (not the case here but this is an example)
        givenText = chance.string(); // creating dummy text with chance
        givenClass = chance.string();
        givenOnClick = sinon.spy(); // creating a Sinon spy - a fully featured mock function so we can see call count
                                    // args that were used to call it, errors, etc.
        wrapper = shallow(
            <SelectOption
                class={givenClass}
                text={givenText}
                onClick={givenOnClick}
            />); // create a shallow wrapper of our component with the dummy text/function
    });
    it('should have given onclick function ', () => { // it (part of Jest): a test case, takes a description and function
        wrapper.simulate('click'); // enzyme method used to click on the component
        //expect is part of chai
        expect(givenOnClick).to.have.property('callCount', 1); // make sure the function was called exactly once
    });
    it('should have div as first and only child', () => {
        expect(wrapper.children()).to.have.lengthOf(1); // wrapper methods like children() and find() are used to inspect
        expect(wrapper.find('div')).to.have.lengthOf(1); // the correctness of the component mocked above
    });
    it('should have correct option text', () => {
        expect(wrapper.contains(givenText)).to.equal(true);
    })
    it('should have correct class Name', () => {
        expect(wrapper.prop('className')).to.equal(givenClass);
    })
});
