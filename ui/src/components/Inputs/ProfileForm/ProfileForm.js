import React, {Component} from 'react';
import { Form, FormGroup, Label, Input, CustomInput, } from 'reactstrap';
import Button from "../ButtonList/Button.js";

import "./ProfileForm.scss";

/*
    Takes 1 Prop:
        
        this.props.nextQuestion: moves app to next question and submits form data
 */
class ProfileForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            selected_sex_prefs: [],
            selected_genders: []
        };

        this.update_sex_pref = this.update_sex_pref.bind(this)
        this.update_gender = this.update_gender.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
    }

    update_name(e) {
        this.setState({name: e.target.value});
    }

    update_email(e) {
        this.setState({email: e.target.value});
    }

    update_sex_pref(option) {
        let new_sex_prefs;

        if (this.state.selected_sex_prefs.includes(option)) {
            new_sex_prefs = this.state.selected_sex_prefs.filter(o => o !== option);
        } else {
            new_sex_prefs = this.state.selected_sex_prefs;
            new_sex_prefs.push(option);
        }

        this.setState({selected_sex_prefs: new_sex_prefs});
    }

    update_gender(option) {
        let new_genders;

        if (this.state.selected_genders.includes(option)) {
            new_genders = this.state.selected_genders.filter(o => o !== option);
        } else {
            new_genders = this.state.selected_genders;
            new_genders.push(option);
        }

        this.setState({selected_genders: new_genders});
    }

    render_sex_prefs() {
        let sex_prefs = ["male", "female", "other"];

        let checkboxes = sex_prefs.map(option => {
            let id = `sex_prefs_${option}`;
            return (
                <div>
                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" id={id} onChange={e => this.update_sex_pref(option)}/>{' '}
                            {option.toUpperCase()}
                        </Label>
                    </FormGroup>
                </div>
            )
        });

        return checkboxes
    }
    /*
    * BAD DESIGN /\ these \/ are are copies just because I didn't feel like using a separate param
     */
    render_gender() {
        let genders = ["male", "female", "other"];

        let checkboxes = genders.map(option => {
            let id = `gender_${option}`;
            return (
                <div>
                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" id={id} onChange={e => this.update_gender(option)}/>{' '}
                            {option.toUpperCase()}
                        </Label>
                    </FormGroup>
                </div>
            )
        });

        return checkboxes
    }

    nextQuestion() {

        let {
            name,
            email,
            selected_sex_prefs,
            selected_genders
        } = this.state;

        let profile = {name, email, sex_prefs: selected_sex_prefs, gender: selected_genders};
        this.props.nextQuestion(profile);
    }

    render() {
        return (
            <div className="profile-form">
                <h3>MatchApp proprietary dating app personal info form</h3>
                <h5>Why? I don't know.</h5>
                <Form>
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input placeholder="name" onChange={e => this.update_name(e)}/>
                        <Label for="email">Email</Label>
                        <Input type="email" placeholder="steve@example.com" onChange={e => this.update_email(e)}/>
                    </FormGroup>
                    <FormGroup>
                        <Label>Select your gender(s)</Label>
                        {this.render_gender()}
                    </FormGroup>
                    <FormGroup>
                        <Label>Looking for</Label>
                        {this.render_sex_prefs()}
                    </FormGroup>
                </Form>
                <Button
                    text="Done"
                    onClick={this.nextQuestion}
                    />
            </div>
        );
    }
}

export default ProfileForm;