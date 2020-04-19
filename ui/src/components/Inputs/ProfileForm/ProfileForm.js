import React, {Component} from 'react';

import "./ProfileForm.scss";

/*
    Takes 1 Prop:

        this.props.sexual_pref_options: an array of sexual preference options as strings.
        These are retrieved from the server when form is built
 */
class ProfileForm extends Component {
    render() {
        return (
            <div>
                <p>
                    Hello world
                </p>
            </div>
        )
    }
}

export default ProfileForm;