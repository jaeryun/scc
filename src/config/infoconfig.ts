import type { InfobarContent } from '@/components/ui/infobar';

export const workspacesInfoContent: InfobarContent = {
  title: 'Workspaces Management',
  sections: [
    {
      title: 'Overview',
      description:
        '워크스페이스 관리 페이지에서는 여러 워크스페이스를 생성하고 전환할 수 있습니다. 각 워크스페이스는 독립적인 팀, 역할, 권한을 가지며 하나의 계정으로 여러 프로젝트나 팀을 관리할 수 있습니다.',
      links: []
    },
    {
      title: 'Creating Workspaces',
      description:
        '새로운 워크스페이스를 생성하려면 워크스페이스 목록에서 생성 버튼을 클릭하세요. 워크스페이스 이름과 초기 설정을 입력하면 새로운 워크스페이스가 생성됩니다.',
      links: []
    },
    {
      title: 'Switching Workspaces',
      description:
        '워크스페이스 목록에서 원하는 워크스페이스를 클릭하여 전환할 수 있습니다. 선택한 워크스페이스가 현재 활성 컨텍스트가 되며, 해당 워크스페이스에 속한 리소스만 접근할 수 있습니다.',
      links: []
    },
    {
      title: 'Workspace Features',
      description:
        '각 워크스페이스는 독립적인 팀 멤버, 역할, 권한, 결제 정보를 가집니다. 이를 통해 하나의 계정으로 여러 프로젝트나 팀을 관리하면서 데이터와 설정을 분리할 수 있습니다.',
      links: []
    },
    {
      title: 'Permission System',
      description:
        '서버 사이드 권한 체크를 통해 사용자는 자신이 속한 활성 워크스페이스의 리소스에만 접근할 수 있습니다. 역할 기반 접근 제어(RBAC)를 지원합니다.',
      links: []
    }
  ]
};

export const teamInfoContent: InfobarContent = {
  title: 'Team Management',
  sections: [
    {
      title: 'Overview',
      description:
        '팀 관리 페이지에서는 워크스페이스 팀 멤버, 역할, 보안 설정 등을 관리할 수 있습니다. 조직 관리 컴포넌트를 통해 포괄적인 팀 관리 기능을 제공합니다.',
      links: []
    },
    {
      title: 'Managing Team Members',
      description:
        '이 페이지에서 팀 멤버를 추가, 삭제, 관리할 수 있습니다. 이메일로 새 멤버를 초대하고 역할을 할당하며 접근 수준을 제어할 수 있습니다. 각 멤버는 역할에 따라 다른 권한을 가집니다.',
      links: []
    },
    {
      title: 'Roles and Permissions',
      description:
        '관리자 설정에서 기본 역할과 권한을 구성할 수 있습니다. 역할은 팀 멤버가 워크스페이스 내에서 수행할 수 있는 작업을 정의합니다. 일반적인 역할로는 관리자, 멤버, 그리고 커스텀 역할이 있습니다.',
      links: []
    },
    {
      title: 'Security Settings',
      description:
        '워크스페이스의 보안 설정을 관리할 수 있습니다. 인증 요구사항, 세션 관리, 접근 제어 등을 설정하여 조직의 데이터와 리소스를 보호할 수 있습니다.',
      links: []
    },
    {
      title: 'Organization Settings',
      description:
        '워크스페이스 이름, 로고 등 일반적인 조직 설정을 구성할 수 있습니다. 이러한 설정은 전체 워크스페이스에 적용되며 모든 팀 멤버에게 영향을 줍니다.',
      links: []
    },
    {
      title: 'Navigation RBAC System',
      description:
        '애플리케이션에는 클라이언트 사이드 낤비게이션 필터링 시스템이 포함되어 있습니다. `useNav` 훅을 통해 `requireOrg`, `permission`, `role` 체크를 지원하며 즉각적인 접근 제어가 가능합니다. 낤비게이션 항목은 `src/config/nav-config.ts`의 `access` 속성으로 구성됩니다.',
      links: []
    }
  ]
};

export const billingInfoContent: InfobarContent = {
  title: 'Billing & Plans',
  sections: [
    {
      title: 'Overview',
      description:
        '결제 관리 페이지에서는 조직의 구독 및 사용량 한도를 관리할 수 있습니다. 조직 수준의 구독 관리와 통합 결제 처리를 제공하는 결제 및 구독 관리 시스템을 사용합니다.',
      links: []
    },
    {
      title: 'Available Plans',
      description:
        '가격 테이블을 통해 사용 가능한 요금제를 확인하고 구독할 수 있습니다. 요금제는 관리자 콘솔에서 생성 및 관리되며, 일반적으로 묶인 free, pro, team 등급이 포함됩니다.',
      links: []
    },
    {
      title: 'Plan Features',
      description:
        '각 요금제에는 애플리케이션의 기능을 잠금 해제하는 특정 기능이 포함될 수 있습니다. 기능은 코드에서 `has()` 함수를 통해 확인할 수 있습니다.',
      links: []
    },
    {
      title: 'Access Control',
      description:
        '요금제와 기능은 애플리케이션 전반의 접근 제어에 사용됩니다. 서버 사이드 체크는 요금제나 기능 접근을 검증하고, 클라이언트 사이드는 구독 상태에 따라 콘텐츠를 조걶적으로 렌더링합니다.',
      links: []
    },
    {
      title: 'Billing Cost Structure',
      description:
        '결제 시스템은 거래당 수수료와 결제 처리 수수료가 발생할 수 있습니다. 요금제와 가격은 관리자 콘솔에서 관리되며, 기존 결제 시스템과 동기화되지 않을 수 있습니다.',
      links: []
    },
    {
      title: 'Setup Requirements',
      description:
        '결제 기능을 활성화하려면 관리자 콘솔에서 결제 설정을 활성화해야 합니다. 개발 환경용 테스트 게이트웨이 또는 프로덕션용 실제 결제 계정 중에서 선택할 수 있습니다.',
      links: []
    },
    {
      title: 'Beta Status',
      description:
        '결제 기능은 현재 베타 상태이며 API는 실험적일 수 있으므로 변경될 수 있습니다. 잠재적인 중단을 최소화하려면 SDK 버전을 고정하는 것을 권장합니다.',
      links: []
    }
  ]
};

export const productInfoContent: InfobarContent = {
  title: 'Product Management',
  sections: [
    {
      title: 'Overview',
      description:
        'The Products page allows you to manage your product catalog. You can view all products in a table format with server-side functionality including sorting, filtering, pagination, and search capabilities. Use the "Add New" button to create new products.',
      links: [
        {
          title: 'Product Management Guide',
          url: '#'
        }
      ]
    },
    {
      title: 'Adding Products',
      description:
        'To add a new product, click the "Add New" button in the page header. You will be taken to a form where you can enter product details including name, description, price, category, and upload product images.',
      links: [
        {
          title: 'Adding Products Documentation',
          url: '#'
        }
      ]
    },
    {
      title: 'Editing Products',
      description:
        'You can edit existing products by clicking on a product row in the table. This will open the product edit form where you can modify any product information. Changes are saved automatically when you submit the form.',
      links: [
        {
          title: 'Editing Products Guide',
          url: '#'
        }
      ]
    },
    {
      title: 'Deleting Products',
      description:
        'Products can be deleted from the product listing table. Click the delete action for the product you want to remove. You will be asked to confirm the deletion before the product is permanently removed from your catalog.',
      links: [
        {
          title: 'Product Deletion Policy',
          url: '#'
        }
      ]
    },
    {
      title: 'Table Features',
      description:
        'The product table includes several powerful features to help you manage large product catalogs efficiently. You can sort columns by clicking on column headers, filter products using the filter controls, navigate through pages using pagination, and quickly find products using the search functionality.',
      links: [
        {
          title: 'Table Features Documentation',
          url: '#'
        },
        {
          title: 'Sorting and Filtering Guide',
          url: '#'
        }
      ]
    },
    {
      title: 'Product Fields',
      description:
        'Each product can have the following fields: Name (required), Description (optional text), Price (numeric value), Category (for organizing products), and Image Upload (for product photos). All fields can be edited when creating or updating a product.',
      links: [
        {
          title: 'Product Fields Specification',
          url: '#'
        }
      ]
    }
  ]
};
