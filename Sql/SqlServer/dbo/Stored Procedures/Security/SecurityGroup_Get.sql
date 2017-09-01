CREATE PROCEDURE [dbo].[SecurityGroup_Get]
	@groupId int
AS
	SELECT * FROM SecurityGroups WHERE groupId=@groupId
