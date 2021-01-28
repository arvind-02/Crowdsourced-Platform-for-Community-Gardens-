import { useState } from 'react';
import { Input, Button, Loader, Message } from 'semantic-ui-react';
import './New.css'

const New = (props) => {
    const [selectedFile, setSelectedFile] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const atlantaConfig = {
        "center": [-84.3880, 33.7490], zoom: 10, view: 'Auto',
        "authOptions": {
            "authType": "subscriptionKey",
            "subscriptionKey": "oJw5kVebBOggGf15Sn_CLR3jIN7xQrQulnRC7567uVc"
        }
    }

    var subscriptionKeyCredential = new window.atlas.service.SubscriptionKeyCredential(atlantaConfig.authOptions.subscriptionKey);
    var pipeline = window.atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);
    var searchURL = new window.atlas.service.SearchURL(pipeline);

    const getGardenPosition = async (address) => {
        var query = address;
        try {
            var results = await searchURL.searchAddress(window.atlas.service.Aborter.timeout(10000), query, {
                limit: 1
            })
            var data = results.geojson.getFeatures();
            if (data["features"]) {
                return data["features"][0]["geometry"]["coordinates"];
            }
            
        } catch (err) {
            console.log(err);
        }
    }

    const submit = async (e) => {
        e.preventDefault();
        if (selectedFile === "" || name === "" || address === "" || email === "" || description === "") {
            setMessage("Please fill in all required fields.");
            return;
        } else {
            setMessage("");
        }
        setLoading(true);
        var formData = new FormData();
        var formName = name;
        var formAddress = address;
        var formEmail = email;
        var formDescription = description;
        try {
            var coordinates = await getGardenPosition(formAddress);
        } catch(err) {
            setMessage("Cannot seem to find that address. Try again.")
            return;
        }
        formData.append("path", selectedFile, `name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}%# xCoord: ${coordinates[0]}%# yCoord: ${coordinates[1]}`);
        console.log(`name: ${formName}%# address: ${formAddress}%# email: ${formEmail}%# description: ${formDescription}%# xCoord: ${coordinates[0]}%# yCoord: ${coordinates[1]}`)
        fetch(`/api/garden-post`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.status === 200) {
                setMessage("Success!")
            } else {
                setMessage("Please try submitting again.")
            }
        });
        setLoading(false);
        clearForm();
    }

    const clearForm = () => {
        document.getElementById("gardenForm").reset();
        setName("");
        setAddress("");
        setEmail("");
        setDescription("");
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
            <form method="POST" onSubmit={submit} className="newForm" id ="gardenForm">
                <Input type="text" className="gardenFormField" placeholder="Garden Name" name="name" onChange={onNameChange}/>
                <Input type="text" className="gardenFormField" placeholder="Garden Address" name="address" onChange={onAddressChange}/>
                <Input type="text" className="gardenFormField" placeholder="Your Contact Info" name="email" onChange={onEmailChange}/>
                <textarea className="gardenFormField ui" placeholder="Tell us about this garden!" rows="3" name="description" onChange={onDescriptionChange}/>
                <Input type="file" className="gardenFormField" name="path" id="path" onChange={onFileChange}/>
                <Button type="submit" className="gardenFormField" positive>Submit</Button>
                {loading ? <div className="loadingDiv"><Loader active inline /></div> : null}
                {message ? <Message><Message.Header>{message}</Message.Header></Message> : null}
            </form>
        </div>
    );
}

export default New;