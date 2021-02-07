
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {shallow, configure} from 'enzyme';
import Chance from 'chance';
import { expect } from 'chai'
import sinon from 'sinon';

import NavBar from "./NavBar";


let chance = new Chance();
configure({adapter: new Adapter()});

describe('NavBar Tests', () => {

    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <NavBar

            />);
    });

    it('should have div as first and only child', () => {
        expect(wrapper.children()).to.have.lengthOf(1);
        expect(wrapper.find('div')).to.have.lengthOf(1);
    });
    it('should have div with only one child which is a Navbar', () => {
        expect(wrapper.childAt(0).children()).to.have.lengthOf(1);
        expect(wrapper.childAt(0).find('Navbar')).to.have.lengthOf(1);
    });
    it('should have Navbar with only one child which is a NavbarBrand', () => {
        expect(wrapper.childAt(0).childAt(0).children()).to.have.lengthOf(1);
        expect(wrapper.childAt(0).childAt(0).find('NavbarBrand')).to.have.lengthOf(1);
    });
    it('should have NavbarBrand with only one child which is a NavBarLogo', () => {
        expect(wrapper.childAt(0).childAt(0).childAt(0).find('NavBarLogo')).to.have.lengthOf(1);
    });

});
