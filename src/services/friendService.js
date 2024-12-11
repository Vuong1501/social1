import MODELS from '../models/models';
import models from '../entity/index';
// import _, { includes, result } from 'lodash';
// import * as ApiErrors from '../errors';
// import ErrorHelpers from '../helpers/errorHelpers';
// import filterHelpers from '../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { Op/*, where*/ } from 'sequelize';
// import { reject, resolve } from 'bluebird';

const { users, friend/*, sequelize*/, requestFriend, locationHistories } = models;

export default {
    sendRequestFriend: async (param) => {
        const userReceiveId = param.userReceiveId;
        const userSendId = param.userSendId;
        // không gửi kết bạn cho chính mình
        if (userSendId === userReceiveId) {
            throw new Error('Không gửi kết bạn cho chính mình');
        }

        const existFriend = await MODELS.findOne(friend, {
            where: {
                [Op.or]: [
                    { user1_id: userSendId, user2_id: userReceiveId },
                    { user1_id: userReceiveId, user2_id: userSendId }
                ]
            }
        });

        if (existFriend) {
            throw new Error('Bạn đã là bạn bè, không thể gửi lời mời kết bạn');
        }

        // xem đã gửi lời mời trước đó chưa
        const existRequest = await MODELS.findOne(requestFriend, {
            where: {
                [Op.or]: [
                    { user_send_id: userSendId, user_receive_id: userReceiveId },
                    { user_send_id: userReceiveId, user_receive_id: userSendId },
                ],
            },
        });

        if (existRequest) {
            throw new Error('Lời mời kết bạn đã tồn tại');
        }

        //Tạo lời mời kết bạn
        const newRequest = await MODELS.create(requestFriend, {
            user_send_id: userSendId,
            user_receive_id: userReceiveId,
        });
        return newRequest;
    },
    // kết bạn rồi nhưng vẫn chấp nhận được
    handleRequestFriend: async (param) => {
        const { requestId, status } = param;

        // lấy ra bản ghi yêu cầu kết bạn
        const request = await MODELS.findOne(requestFriend, {
            where: {
                id: requestId,
            },
        });

        if (!request) {
            throw new Error('Lời mời kết bạn không tồn tại');
        }


        if (status === 'accept') {
            const { user_send_id, user_receive_id } = request;
            // lưu theo cặp
            const friendPair = [
                { user1_id: user_send_id, user2_id: user_receive_id },
                { user1_id: user_receive_id, user2_id: user_send_id },
            ];
            // xóa lời mời kết bạn khỏi bảng requestFriend
            await MODELS.destroy(requestFriend, {
                where: { id: requestId },
            });
            for (let pair of friendPair) {
                const existingFriendship = await friend.findOne({
                    where: {
                        user1_id: pair.user1_id,
                        user2_id: pair.user2_id,
                    },
                });

                if (existingFriendship) {
                    console.log(` ${pair.user1_id} và ${pair.user2_id} đã là bạn bè`);
                } else {
                    // Thêm cặp bạn bè vào bảng friend
                    await MODELS.create(friend, { pair });
                    console.log('Service - Friend relationship created:', pair);
                }
            }
        } else if (status === 'reject') {
            // Từ chối kết bạn: Xóa lời mời kết bạn trong bảng `requestFriend`
            await MODELS.destroy(requestFriend, {
                where: { id: requestId },
            });
            console.log('Service - Friend Request rejected and removed.');
        } else {
            throw new Error('Hành động không hợp lệ.');
        }

        return { requestId, status };
    },

    // get_list: async (param) =>
    //     new Promise(async (resolve, reject) => {
    //         try {
    //             const { sort, range, filter, userId } = param;

    //             const whereClause = {
    //                 user1_id: userId,
    //             };

    //             let whereFriend = {};
    //             if (filter.name) {
    //                 whereFriend = { name: { [Op.like]: `%${filter.name}%` } };
    //             }

    //             const perPage = range[1] - range[0] + 1;
    //             const page = Math.floor(range[0] / perPage);

    //             // console.log("whereClause:", JSON.stringify(whereClause, null, 2));
    //             await MODELS.findAndCountAll(friend, {
    //                 where: whereClause,
    //                 include: [
    //                     {
    //                         model: users,
    //                         as: 'user2',
    //                         attributes: ['id', 'name'],
    //                         where: whereFriend,
    //                         include: [
    //                             {
    //                                 model: locationHistories,
    //                                 as: 'locationHistories',
    //                             },
    //                         ],
    //                     },
    //                 ],
    //                 order: sort,
    //                 limit: perPage,
    //                 offset: range[0],
    //             })
    //                 .then(result => {
    //                     resolve({
    //                         ...result,
    //                         page: page + 1,
    //                         perPage
    //                     });
    //                 })
    //         } catch (error) {
    //             // console.log("errrrrrrrr", error);
    //             throw new Error('Error fetching friends: ' + error.message);
    //         }
    //     })

    get_list: async (param) =>
        new Promise(async (resolve, reject) => {
            try {
                const { sort, range, filter, userId } = param;

                const whereClause = {
                    user1_id: userId,
                };

                let whereFriend = {};
                if (filter.name) {
                    whereFriend = { name: { [Op.like]: `%${filter.name}%` } };
                }

                const perPage = range[1] - range[0] + 1;
                const page = Math.floor(range[0] / perPage);

                // Lấy tổng số bạn bè thỏa mãn điều kiện
                const totalFriends = await MODELS.count(friend, {
                    where: whereClause,
                    include: [
                        {
                            model: users,
                            as: 'user2',
                            where: whereFriend,
                        },
                    ],
                });

                console.log("totalFriends", totalFriends);

                // Lấy danh sách bạn bè với phân trang
                const friends = await MODELS.findAll(friend, {
                    where: whereClause,
                    include: [
                        {
                            model: users,
                            as: 'user2',
                            attributes: ['id', 'name'],
                            where: whereFriend,
                            include: [
                                {
                                    model: locationHistories,
                                    as: 'locationHistories',
                                },
                            ],
                        },
                    ],
                    order: sort,
                    limit: perPage,
                    offset: range[0],
                });

                resolve({
                    data: friends,
                    total: totalFriends,
                    page: page + 1,
                    perPage,
                });
            } catch (error) {
                reject(new Error('Error fetching friends: ' + error.message));
            }
        })

};
