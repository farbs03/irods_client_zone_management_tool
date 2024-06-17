import axios from 'axios';

export const AddUserController = (name, zone, userType, restApiLocation) => {
    console.log("Before request")
    // let req = axios({
    //     method: 'POST',
    //     url: `${restApiLocation}/users-groups`,
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
    //         'Test': "Chris"
    //     },
    //     params: {
    //         op: "create_user"
    //     },
    //     data: {
    //         name: name,
    //         zone: zone,
    //         "user-type": userType,
    //     }
    // })
    const params = new URLSearchParams()
    params.append("op", "create_user")
    params.append("name", name)
    params.append("zone", zone)
    params.append("user-type", userType)
    let req = axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                // 'content-type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
    return req
}

export const ModifyUserPasswordController = (name, zone, newPassword, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "set_password",
            name: name,
            zone: zone,
            "new-password": newPassword
        }
    })
}

export const ModifyUserTypeController = (name, zone, newUserType, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "set_user_type",
            name: name,
            zone: zone,
            "new-user-type": newUserType
        }
    })
}


export const RemoveUserController = async (name, zone, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "remove_user",
            name: name,
            zone: zone
        }
    })
}