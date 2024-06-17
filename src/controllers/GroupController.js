import axios from 'axios';

export const AddGroupController = (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: 'create_group',
            name: name,
        }
    })
}

export const RemoveGroupController = async (name, restApiLocation) => {
    return axios({
        method: 'POST',
        url: `${restApiLocation}/users-groups`,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`
        },
        params: {
            op: "remove_group",
            name: name,
        }
    })
}

export const AddUserToGroupController = (user, zone, group, restApiLocation) => {
    const params = new URLSearchParams({
        op: 'add_to_group',
        user: user,
        zone: zone,
        group: group,
    });

    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                // 'content-type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

export const RemoveUserFromGroupController = (user, zone, group, restApiLocation) => {
    const params = new URLSearchParams({
        op: 'remove_from_group',
        user: user,
        zone: zone,
        group: group,
    });

    return axios.post(
        `${restApiLocation}/users-groups`,
        params,
        {
            headers: {
                // 'content-type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${localStorage.getItem('zmt-token')}`,
            }
        } 
    )
}

