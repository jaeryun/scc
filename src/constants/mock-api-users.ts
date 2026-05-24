////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type User = {
  id: string;
  primary_team: string;
  secondary_team: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
};

// Mock user data store
export const fakeUsers = {
  records: [] as User[],

  initialize() {
    const sampleUsers: User[] = [];
    function generateRandomUserData(id: string): User {
      const roles = ['admin', 'viewer'];
      const statuses = ['Active', 'Inactive'];
      const primaryTeams = ['인프라팀', '개발팀', '보안팀', '네트워크팀', '플랫폼팀'];
      const secondaryTeams = ['데이터센터팀', '클라우드팀', '백엔드팀', '프론트엔드팀', 'DevOps팀'];

      return {
        id,
        primary_team: faker.helpers.arrayElement(primaryTeams),
        secondary_team: faker.helpers.arrayElement(secondaryTeams),
        status: faker.helpers.arrayElement(statuses),
        role: faker.helpers.arrayElement(roles),
        created_at: faker.date.between({ from: '2022-01-01', to: '2023-12-31' }).toISOString(),
        updated_at: faker.date.recent().toISOString()
      };
    }

    const usernameParts = [
      'daniel.yun',
      'james.kim',
      'lisa.park',
      'noah.lee',
      'emma.choi',
      'oliver.jung',
      'sophia.kang',
      'william.shin',
      'ava.jang',
      'benjamin.han',
      'charlotte.ryu',
      'henry.moon',
      'amelia.song',
      'lucas.ahn',
      'mia.seo',
      'alexander.nam',
      'ella.baek',
      'mason.hwang',
      'scarlett.ko',
      'ethan.chang',
      'grace.cho',
      'logan.heo',
      'chloe.sim',
      'jackson.noh',
      'zoe.maeng',
      'sebastian.huh',
      'aria.uhm',
      'owen.bang',
      'lily.pyo',
      'caleb.kwon',
      'hannah.yeom',
      'dylan.jeon',
      'nora.chae',
      'wyatt.son',
      'aurora.chi',
      'ryan.tak',
      'violet.kil',
      'nathan.ok',
      'stella.pyeon',
      'liam.yang',
      'savannah.kook',
      'leo.kyung',
      'aurora.jin',
      'gabriel.kong',
      'layla.pil',
      'levi.won',
      'isla.kim',
      'andrew.bae',
      'penelope.ho',
      'julian.joo'
    ];

    for (let i = 0; i < usernameParts.length; i++) {
      sampleUsers.push(generateRandomUserData(usernameParts[i]));
    }

    this.records = sampleUsers;
  },

  async getAll({ roles = [], search }: { roles?: string[]; search?: string }) {
    let users = [...this.records];

    if (roles.length > 0) {
      users = users.filter((user) => roles.includes(user.role));
    }

    if (search) {
      users = matchSorter(users, search, {
        keys: ['id', 'primary_team', 'secondary_team']
      });
    }

    return users;
  },

  async createUser(data: Omit<User, 'created_at' | 'updated_at'>) {
    await delay(800);

    const newUser: User = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.records.push(newUser);

    return {
      success: true,
      message: 'User created successfully',
      user: newUser
    };
  },

  async updateUser(id: string, data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    await delay(800);

    const index = this.records.findIndex((user) => user.id === id);

    if (index === -1) {
      return { success: false, message: `User with ID ${id} not found` };
    }

    this.records[index] = {
      ...this.records[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      message: 'User updated successfully',
      user: this.records[index]
    };
  },

  async deleteUser(id: string) {
    await delay(800);

    const index = this.records.findIndex((user) => user.id === id);

    if (index === -1) {
      return { success: false, message: `User with ID ${id} not found` };
    }

    this.records.splice(index, 1);

    return {
      success: true,
      message: 'User deleted successfully'
    };
  },

  async getUsers({
    page = 1,
    limit = 10,
    roles,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    roles?: string | string[];
    search?: string;
    sort?: string;
  }) {
    await delay(800);
    const rolesArray = roles ? (Array.isArray(roles) ? roles : String(roles).split(/[.,]/)) : [];
    const allUsers = await this.getAll({
      roles: rolesArray,
      search
    });

    // Sorting
    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as {
          id: string;
          desc: boolean;
        }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          allUsers.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[id];
            const bVal = (b as Record<string, unknown>)[id];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {
        // Invalid sort param — ignore
      }
    }

    const totalUsers = allUsers.length;

    const offset = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(offset, offset + limit);

    return {
      success: true,
      time: new Date().toISOString(),
      message: 'Sample data for testing and learning purposes',
      total_users: totalUsers,
      offset,
      limit,
      users: paginatedUsers
    };
  }
};

fakeUsers.initialize();
