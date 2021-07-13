import { useState, useRef } from 'react';
import { Input, Loader, Message } from 'semantic-ui-react';
import './New.css'

const New = () => {
    const [selectedFile, setSelectedFile] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [labelName, setLabelName] = useState("Select an image of the garden");
    const fileRef = useRef();

    const atlantaConfig = {
        "center": [-84.3880, 33.7490], zoom: 10, view: 'Auto',
        "authOptions": {
            "authType": "subscriptionKey",
            "subscriptionKey": ""
        }
    }

    var subscriptionKeyCredential = new window.atlas.service.SubscriptionKeyCredential(atlantaConfig.authOptions.subscriptionKey);
    var pipeline = window.atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
    var searchURL = new window.atlas.service.SearchURL(pipeline);

    const getGardenPosition = async (address) => {
        var query = address;
        var results = await searchURL.searchAddress(window.atlas.service.Aborter.timeout(10000), query, {
            limit: 1
        })
        var data = results.geojson.getFeatures();
        if (data["features"]) {
            return data["features"][0]["geometry"]["coordinates"];
        }
    }

    const submit = async (e) => {
        e.preventDefault();
        setMessage("");
        if (selectedFile === "" || name === "" || address === "" || email === "" || description === "") {
            setError("Please fill in all required fields.");
            return;
        } else {
            setError("");
        }
        setLoading(true);
        var formData = new FormData();
        var formName = name;
        var formAddress = address;
        var formEmail = email;
        var formDescription = description;
        try {
            var coordinates = await getGardenPosition(formAddress);
        } catch (err) {
            setError("Cannot seem to find that address. Try again.")
            setLoading(false);
            return;
        }
        formData.append("path", selectedFile, `name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}%# xCoord: ${coordinates[0]}%# yCoord: ${coordinates[1]}`);
        console.log(`name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}%# xCoord: ${coordinates[0]}%# yCoord: ${coordinates[1]}`)
        fetch(`/api/garden-post`, { 
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.status === 200) {
                setMessage("Success!");
                clearForm();
            } else {
                setError("Server error. Please try submitting again.")
            }
        });
        setLoading(false);
    }

    const clearForm = () => {
        document.getElementById("gardenForm").reset();
        setName("");
        setAddress("");
        setEmail("");
        setDescription("");
        setLabelName("Select an image of the garden")
    }

    const onNameChange = (event) => {
        setName(event.target.value.replaceAll("'", "''").replaceAll("%#", ""));
    };

    const onAddressChange = (event) => {
        setAddress(event.target.value.replaceAll("'", "''").replaceAll("%#", ""));
    };

    const onEmailChange = (event) => {
        setEmail(event.target.value.replaceAll("'", "''").replaceAll("%#", ""));
    };

    const onDescriptionChange = (event) => {
        setDescription(event.target.value.replaceAll("'", "''").replaceAll("%#", ""));
    };

    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setLabelName(event.target.files[0].name)
    };

    return (
        <div style={{ margin: '10px' }}>
            <form method="POST" onSubmit={submit} className="newForm" id="gardenForm">
                <Input type="text" maxLength="200" className="gardenFormField" placeholder="Garden Name (200 characters)" name="name" onChange={onNameChange} />
                <Input type="text" maxLength="200" className="gardenFormField" placeholder="Garden Address (200 characters)" name="address" onChange={onAddressChange} />
                <Input type="text" maxLength="100" className="gardenFormField" placeholder="Your Contact Info (100 characters)" name="email" onChange={onEmailChange} />
                <textarea className="gardenFormField ui" maxLength="1000" placeholder="Tell us about this garden! (1000 characters)" rows="3" name="description" onChange={onDescriptionChange} />
                <Input type="file" ref = {fileRef} className="gardenFormField filePicker" name="path" id="path" onChange={onFileChange} />
                <label htmlFor="path" className="gardenFormField fileLabel">{labelName}</label>
                <button type="submit" className="gardenFormField submitButton">Submit</button>
                {loading ? <div className="loadingDiv"><Loader active inline /></div> : null}
                {message ? <Message positive><Message.Header>{message}</Message.Header></Message> : null}
                {error ? <Message negative><Message.Header>{error}</Message.Header></Message> : null}
            </form>
        </div>
    );
}

export default New;
