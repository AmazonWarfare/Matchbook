import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {shallow, configure} from 'enzyme';
import Chance from 'chance';
import { expect } from 'chai'
import sinon from 'sinon';

import SelectOption from "./SelectOption";


let chance = new Chance();
configure({adapter: new Adapter()});

describe('Select Option Tests', () => {

    let givenText,
        givenClass,
        givenOnClick,
        wrapper;

    beforeEach(() => {



        givenText = chance.string();
        givenClass = chance.string();
        givenOnClick = sinon.spy();

        wrapper = shallow(
            <SelectOption
                class={givenClass}
                text={givenText}
                onClick={givenOnClick}
            />);
    });
    it('should have given onclick function ', () => {
        wrapper.simulate('click');

        expect(givenOnClick).to.have.property('callCount', 1);
    });
    it('should have div as first and only child', () => {
        expect(wrapper.children()).to.have.lengthOf(1);
        expect(wrapper.find('div')).to.have.lengthOf(1);
    });
    it('should have correct option text', () => {
        expect(wrapper.contains(givenText)).to.equal(true);
    })
    it('should have correct class Name', () => {
        expect(wrapper.prop('className')).to.equal(givenClass);
    })
});
