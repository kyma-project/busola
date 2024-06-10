import { ConditionList as ConditionListComponent } from 'shared/components/ConditionList/ConditionList';

export const ConditionList = ({ value, structure }) => {
  if (!Array.isArray(value) || value?.length === 0) {
    return null;
  }

  const conditions = value.map(v => {
    return {
      header: {
        status: v.status,
        titleText: v.type,
      },
      message: v.message,
    };
  });

  return <ConditionListComponent conditions={conditions} />;
};

ConditionList.array = true;
