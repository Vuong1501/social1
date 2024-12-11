import MODELS from '../models/models';
import models from '../entity/index';

const { locationHistories } = models;

export default {
  // sửa lại logic,dùng model, count trước, count >= 10 thì mới findone và xóa
  createLocation: async (param) => {
    const { userId, location, dateCreated } = param;

    // lấy ra tất cả bản ghi về location
    const userLocations = await MODELS.count(locationHistories, {
      where: { userId: userId },
    });

    if (userLocations >= 10) {
      const oldest = await MODELS.findOne(locationHistories, {
        where: { userId: userId },
        order: [['dateCreated', 'ASC']],
      });

      await MODELS.destroy(locationHistories, {
        where: { id: oldest.id },
      });
    }
    // tạo location mới
    const newLocation = await MODELS.create(locationHistories, {
      userId: userId,
      location: location,
      dateCreated: dateCreated,
    });

    return newLocation;
  },
};
