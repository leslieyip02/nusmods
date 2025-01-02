import { shallow, ShallowWrapper } from 'enzyme';

import { CS1010S, CS3216, CS4243 } from '__mocks__/modules';
import { addColors } from 'test-utils/theme';

import { LessonType, Module, ModuleCode } from 'types/modules';
import { TimetableModulesTableComponent, Props } from './TimetableModulesTable';
import styles from './TimetableModulesTable.scss';

function make(props: Partial<Props> = {}) {
  const selectModuleColor = jest.fn();
  const hideLessonInTimetable = jest.fn();
  const showLessonInTimetable = jest.fn();
  const setTaModeInTimetable = jest.fn();
  const unsetTaModeInTimetable = jest.fn();
  const onRemoveModule = jest.fn();
  const resetTombstone = jest.fn();

  const wrapper = shallow(
    <TimetableModulesTableComponent
      semester={1}
      readOnly={false}
      horizontalOrientation={false}
      moduleTableOrder="exam"
      modules={[]}
      tombstone={null}
      selectModuleColor={selectModuleColor}
      hideLessonInTimetable={hideLessonInTimetable}
      showLessonInTimetable={showLessonInTimetable}
      setTaModeInTimetable={setTaModeInTimetable}
      unsetTaModeInTimetable={unsetTaModeInTimetable}
      onRemoveModule={onRemoveModule}
      resetTombstone={resetTombstone}
      {...props}
    />,
  );

  return {
    wrapper,
    selectModuleColor,
    onRemoveModule,
    hideLessonInTimetable,
    showLessonInTimetable,
    resetTombstone,
  };
}

function getModules(wrapper: ShallowWrapper) {
  return wrapper.find(`.${styles.modulesTableRow}`).map((ele) => ele.key());
}

function addTaLessonTypes(
  modules: Module[],
  taInTimetable: { [moduleCode: ModuleCode]: { [lessonType: LessonType]: boolean } } = {},
) {
  return addColors(modules).map((module) => ({
    ...module,
    taInTimetable: taInTimetable[module.moduleCode] ?? {},
  }));
}

describe(TimetableModulesTableComponent, () => {
  const modules = addTaLessonTypes([CS1010S, CS3216]);

  it('should render when empty', () => {
    const { wrapper } = make();
    expect(wrapper.childAt(0).children()).toHaveLength(0);
  });

  it('should display modules in the correct order', () => {
    const orderByExam = getModules(make({ modules }).wrapper);
    expect(orderByExam).toEqual(['CS3216', 'CS1010S']);

    const orderByModuleCode = getModules(make({ modules, moduleTableOrder: 'code' }).wrapper);
    expect(orderByModuleCode).toEqual(['CS1010S', 'CS3216']);
  });

  it('should add tombstone modules back in the correct position', () => {
    // Get the original module order rendering CS1010S, CS4243 and CS3216
    const originalOrder = getModules(
      make({ modules: addTaLessonTypes([CS1010S, CS4243, CS3216]) }).wrapper,
    );

    // Replace CS4243 with a tombstone and check if it remains in the same place
    const tombstone = {
      ...CS4243,
      index: 1,
      colorIndex: 2,
      isHiddenInTimetable: false,
      isTaInTimetable: false,
    };

    const moduleCodes = getModules(
      make({ modules: addTaLessonTypes([CS1010S, CS3216]), tombstone }).wrapper,
    );

    expect(moduleCodes).toEqual(originalOrder);
  });
});