import React, { SyntheticEvent, useMemo } from 'react';
import 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { BehaviorSubject } from 'rxjs';
import { Button, ButtonSet, Form } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import ConditionsWidget from './conditions-widget.component';
import { ConditionDataTableRow } from './conditions.resource';
import styles from './conditions-form.scss';
import { z } from 'zod';
import { useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const conditionFormSchema = z.object({
  category: z.string(),
  condition: z.string(),
  onsetDate: z.string(),
  certainty: z.string(),
  notes: z.string().optional(),
});

type ConditionFormData = z.infer<typeof conditionFormSchema>;

interface ConditionFormProps {
  condition?: ConditionDataTableRow;
  patientUuid?: string;
  context: string;
  closeWorkspace: () => void;
}

const ConditionsForm: React.FC<ConditionFormProps> = ({ closeWorkspace, patientUuid, context, condition }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { register, handleSubmit, formState } = useForm<ConditionFormData>({
    resolver: zodResolver(conditionFormSchema),
    mode: 'onBlur',
    defaultValues: {
      category: condition?.category ?? '',
      condition: condition?.condition ?? '',
      onsetDate: condition?.onsetDate ?? '',
      certainty: condition?.certainty ?? '',
      notes: condition?.notes ?? '',
    },
  });

  const [hasSubmissibleValue, setHasSubmissibleValue] = React.useState(false);
  const submissionNotifier = useMemo(() => new BehaviorSubject<{ isSubmitting: boolean }>({ isSubmitting: false }), []);

  const onSubmit = (data: ConditionFormData) => {
    console.log(data);
    submissionNotifier.next({ isSubmitting: true });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <ConditionsWidget
        patientUuid={patientUuid}
        closeWorkspace={closeWorkspace}
        condition={condition}
        context={context}
        setHasSubmissibleValue={setHasSubmissibleValue}
        submissionNotifier={submissionNotifier}
        register={register}
      />
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={!formState.isValid} kind="primary" type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ConditionsForm;
