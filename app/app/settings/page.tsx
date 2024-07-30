import { SettingsForm } from '../../components/SettingsForm'

export default function Settings () {
  return (
    <>

      <div className="flex flex-col gap-4">
        <div className="px-4 text-main">
          what do you fancy?
        </div>
      </div>

      <SettingsForm />
    </>
  )
}
