import { User, userGroups } from '../model';

export default async req => {
  const userName = req.headers.user_name;

  console.log('header userName: ', userName);
  if (userName === undefined || userName === null || userName === 'null' || userName === '') {
    return -1;
  }
  const dataUser = await User.find({ where: { UserName: userName } });

  if (dataUser) {
    const datauserGroups = await userGroups.findById(dataUser.dataValues.userGroupsId);

    if (datauserGroups) {
      // console.log("datauserGroups ", datauserGroups)
      const groupAdmin = !isNaN(Number(process.env.GROUP_ADMINISTRATOR)) ? Number(process.env.GROUP_ADMINISTRATOR) : 1;

      if (Number(datauserGroups.dataValues.id) === groupAdmin) {
        return 0;
      } else {
        return dataUser.dataValues.id;
      }
    }

    return -1;
  }

  return -1;
};
