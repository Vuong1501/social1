import friendService from '../services/friendService';
import loggerHelpers from '../helpers/loggerHelpers';
import { recordStartTime } from '../utils/loggerFormat';

import * as ApiErrors from '../errors';

export default {

    sendRequest: (req, res, next) => {

        const { userReceiveId } = req.body;
        const userSendId = req.auth.userId/// lấy ra được id của người gửi

        console.log("userReceiveId:", userReceiveId);
        console.log("userSendId:", userSendId);

        const param = { userReceiveId, userSendId };
        console.log("parammm:", param);

        try {
            friendService
                .sendRequestFriend(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: 'Gửi lời mời kết bạn thành công',
                        data: data
                    });
                })
                .catch(error => {
                    console.error("Errorrrrrrrrrrrrrrrrrr", JSON.stringify(error, null, 2));
                    next(error);
                });

        } catch (error) {
            // console.log("errrrrrrrrrrr", error);
            // console.error("Error in try block:", JSON.stringify(error, null, 2));
            next(error);
        }
    },

    handleRequestFriend: (req, res, next) => {
        try {
            const requestId = req.params.id; // lấy ra id của lời mời kết bạn
            const { status } = req.body; // lấy ra trạng thái của lời mời

            // console.log("requestId", requestId);
            // console.log("status", status);

            const param = { requestId, status };
            // console.log("param", param);

            friendService
                .handleRequestFriend(param)
                .then(data => {
                    res.status(200).json({
                        success: true,
                        message: `Lời mời kết bạn đã được ${status === 'accept' ? 'chấp nhận' : 'từ chối'}.`,
                        data: data
                    });
                })
                .catch(error => {
                    console.error("Error in handleRequestFrienddddddddd:", error);
                    next(error);
                });
        } catch (error) {
            console.error("errrrrrr", error);
            next(error);
        }

    },

    get_list: (req, res, next) => {
        recordStartTime.call(req);

        try {
            const { sort, range, filter, attributes } = res.locals;

            const userId = req.auth.userId;

            const param = {
                sort,
                range,
                filter,
                userId,
                attributes
            };

            friendService
                .get_list(param)
                .then((data) => {
                    const dataOutput = {
                        result: {
                            list: data.data,
                            pagination: {
                                current: data.page,
                                pageSize: data.perPage,
                                total: data.total
                            }
                        },
                        success: true,
                        errors: [],
                        messages: []
                    };
                    res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
                    res.send(dataOutput);
                })
                .catch(error => {
                    next(error);
                });
        } catch (error) {
            // error.dataQuery = req.query;
            next(error);
        }
    },




}