import { useState } from 'react';
import { Input } from 'semantic-ui-react';
import './New.css'

const New = (props) => {
    const [selectedFile, setSelectedFile] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const submit = (e) => {
        e.preventDefault();
        if (selectedFile === "" || name === "" || address === "" || email === "" || description === "") {
            setError("Please fill in all required fields.");
            return;
        } else {
            setError("");
        }
        var formData = new FormData();
        var formName = name;
        var formAddress = address;
        var formEmail = email;
        var formDescription = description;
        formData.append("path", selectedFile, `name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}`);
        console.log(`name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}`)
        fetch(`/api/garden-post`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.status === 200) {
                console.log("SUCCESS")
            }
        });
    }
 
    const onNameChange = (event) => {
        setName(event.target.value.replaceAll("'","''").replaceAll("%#", ""));
    };

    const onAddressChange = (event) => {
        setAddress(event.target.value.replaceAll("'","''").replaceAll("%#", ""));
    };

    const onEmailChange = (event) => {
        setEmail(event.target.value.replaceAll("'","''").replaceAll("%#", ""));
    };

    const onDescriptionChange = (event) => {
        setDescription(event.target.value.replaceAll("'","''").replaceAll("%#", ""));
    };

    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    return (
        <div style = {{ margin: '10px'}}>
            <form method="POST" onSubmit={submit} className="newForm">
                <Input type="text" className="gardenFormField" placeholder="Garden Name" name="name" onChange={onNameChange}/>
                <Input type="text" className="gardenFormField" placeholder="Garden Address" name="address" onChange={onAddressChange}/>
                <Input type="text" className="gardenFormField" placeholder="Your Contact Info" name="email" onChange={onEmailChange}/>
                <textarea className="gardenFormField ui" placeholder="Tell us about this garden!" rows="3" name="description" onChange={onDescriptionChange}/>
                <Input type="file" className="gardenFormField" name="path" id="path" onChange={onFileChange}/>
                <Input type="submit" className="gardenFormField" />
            </form>
            <p>{error}</p>
        </div>
    );
}

export default New;