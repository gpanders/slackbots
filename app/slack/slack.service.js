export class SlackService {
    /*@ngInject*/
    constructor($http, $q, UserService) {
        this.$http = $http;
        this.$q = $q;
        this.userService = UserService;
    }

    authorize(token) {
        return this.$q((resolve, reject) => {
            this.$http({
                method: 'GET',
                url: 'https://slack.com/api/auth.test',
                params: { token: token }
            }).then(res => {
                if (res.data.ok) {
                    let user = {};
                    user.token = token;
                    user.username = res.data.user;
                    user.id = res.data['user_id'];
                    resolve(user);
                } else {
                    reject('Invalid token');
                }
            }, res => {
                console.error(res);
                reject('An error occurred');
            });
        });
    }

    getUserInfo(userId) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    this.$http({
                        method: 'GET',
                        url: 'https://slack.com/api/users.info',
                        params: {
                            token: user.token,
                            user: userId
                        }
                    }).then(res => {
                        if (res.data.ok) {
                            var profile = res.data.user.profile;
                            var info = {};
                            info.realName = profile['real_name'];
                            info.imageUrl = profile['image_original'];
                            resolve(info);
                        } else {
                            reject('Slack denied our request for user info');
                            console.error(res.data);
                        }
                    }).catch(res => {
                        reject('Error getting user info');
                        console.error(res);
                    });
                })
                .catch(() => reject('No authenticated user found'));
        });
    }

    postMessage(data) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    data.token = user.token;

                    this.$http({
                        method: 'POST',
                        url: 'https://slack.com/api/chat.postMessage',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: $.param(data)
                    }).then(res => {
                        if (res.data.ok) {
                            resolve(res.data);
                        } else {
                            reject('Slack denied our request to post a message');
                            console.error(res.data);
                        }
                    }).catch(res => {
                        reject('Error posting message');
                        console.error(res);
                    });
                })
                .catch(() => reject('No authorized user found'));
        });
    }

    openIM(userId) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    this.$http({
                        method: 'GET',
                        url: 'https://slack.com/api/im.open',
                        params: {
                            token: user.token,
                            user: userId
                        }
                    }).then(res => {
                        if (res.data.ok) {
                            resolve(res.data.channel.id);
                        } else {
                            reject('Slack denied our request to open an IM channel');
                        }
                    }).catch(res => {
                        console.error(res);
                        reject('Error opening IM channel');
                    });
                })
                .catch(() => reject('No authenticated user found'));
        });
    }

    getData(type) {
        return this.$q((resolve, reject) => {
            this.userService.getUser()
                .then(user => {
                    let token = user.token;

                    if (type === 'users') {
                        let users = {};
                        this.$http({
                            method: 'GET',
                            url: `https://slack.com/api/users.list?token=${token}`
                        }).then(res => {
                            if (res.data.ok) {
                                res.data.members
                                    .filter(member =>
                                        !member.deleted && !member['is_bot'])
                                    .forEach(member =>
                                        { users[member.id] = { name: `@${member.name}` }; });

                                this.$http({
                                    method: 'GET',
                                    url: `https://slack.com/api/im.list?token=${token}`
                                }).then(res => {
                                    if (res.data.ok) {
                                        res.data.ims
                                            .filter(im => im['is_im'] && !im['is_user_deleted'] && users[im.user])
                                            .forEach(im => { users[im.user].im = im.id; });

                                        resolve(users);
                                    } else {
                                        reject('Slack denied our request for IM list');
                                    }
                                }).catch(() => {
                                    reject('Error retrieving IM list for users');
                                });
                            } else {
                                reject('Slack denied our request for users list');
                            }
                        }).catch(() => reject('Error retrieving users list'));

                    } else if (type === 'channels') {
                        let channels = {};
                        this.$http({
                            method: 'GET',
                            url: `https://slack.com/api/channels.list?token=${token}`
                        }).then(res => {
                            if (res.data.ok) {
                                res.data.channels
                                   .filter(channel =>
                                       channel['is_channel'] && channel['is_member'])
                                   .forEach(channel =>
                                       { channels[channel.id] = `#${channel.name}`; });

                                resolve(channels);
                            } else {
                                reject('Slack denied our request for channels list');
                            }
                        }).catch(() => reject('Error retrieving channels list'));

                    } else if (type === 'groups') {
                        let groups = {};
                        this.$http({
                            method: 'GET',
                            url: `https://slack.com/api/groups.list?token=${token}`
                        }).then(res => {
                            if (res.data.ok) {
                                res.data.groups
                                    .filter(group =>
                                        group['is_group'] && !group['is_archived'])
                                    .forEach(group =>
                                        { groups[group.id] = group.name; });

                                resolve(groups);
                            } else {
                                reject('Slack denied our request for groups list');
                            }
                        }).catch(() => reject('Error retrieving groups list'));
                    }
                })
                .catch(() => reject('No authenticated user found'));
        });
    }
}
