
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {shallow, configure} from 'enzyme';
import Chance from 'chance';
import { expect } from 'chai'
import sinon from 'sinon';

import NavBarLogo from "./NavBarLogo";


let chance = new Chance();
configure({adapter: new Adapter()});

describe('Button Tests', () => {

    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <NavBarLogo
            />);
    });

    it('should have img as first and only child', () => {

        expect(wrapper.find('img')).to.have.lengthOf(1);
    });

});
